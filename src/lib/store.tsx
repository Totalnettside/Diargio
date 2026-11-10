import { notifySeller } from "@/lib/seller-notice.functions";
import { saveListingDraft, submitListing, sendReviewNotice, changeListingVisibility } from './moderation.functions';
import { submissionConfirmation } from './moderation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode, type Context } from "react";
import type { Artwork } from "@/data/demo";
import { artworks as demoArtworks } from "@/data/demo";
import { priceFromPayout } from "@/lib/fees";
import { supabase } from "@/integrations/supabase/client";

export type Bid = {
  id: string;
  artworkId: string;
  amount: number;
  message?: string | undefined;
  status: "Sendt" | "Godtatt" | "Avslått" | "Motbud";
  counterAmount?: number;
  createdAt: number;
  buyerId?: string;
  sellerId?: string;
  conversationId?: string | undefined;
  read?: boolean;
};

export type ChatMessage = {
  id: string;
  from: "meg" | "selger";
  text?: string;
  bidAmount?: number;
  createdAt: number;
};

export type Conversation = {
  id: string;
  artworkId: string;
  messages: ChatMessage[];
};

export type SavedSearch = { id: string; query: string; label: string };

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
  conversationId?: string | undefined;
  slug?: string | undefined;
};

type State = {
  favorites: string[];
  collections: Record<string, string[]>;
  followedArtists: string[];
  followedSellers: string[];
  bids: Bid[];
  conversations: Conversation[];
  savedSearches: SavedSearch[];
  notifications: AppNotification[];
  myListings: Artwork[];
};

const initialState: State = {
  favorites: [],
  collections: {},
  followedArtists: [],
  followedSellers: [],
  bids: [],
  conversations: [],
  savedSearches: [],
  notifications: [],
  myListings: [],
};

type Store = State & {
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  addToCollection: (name: string, id: string) => void;
  createCollection: (name: string) => void;
  toggleFollowArtist: (id: string) => void;
  toggleFollowSeller: (id: string) => void;
  placeBid: (artworkId: string, amount: number, message?: string) => Promise<void>;
  markBidRead: (id: string) => Promise<void>;
  decideBid: (id: string, decision: "accepted" | "rejected") => Promise<void>;
  sendMessage: (artworkId: string, text: string) => void;
  saveSearch: (query: string, label: string) => void;
  markAllRead: () => void;
  addListing: (a: Artwork, draft?: boolean) => Promise<void>;
  updateListing: (a: Artwork) => Promise<void>;
  submitListing: (id: string) => Promise<void>;
  changeVisibility: (id: string, action: 'draft'|'withdrawn'|'sold') => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  allArtworks: Artwork[];
};

const g = globalThis as unknown as { __diargioStoreCtx?: Context<Store | null> };
const StoreContext = g.__diargioStoreCtx ?? (g.__diargioStoreCtx = createContext<Store | null>(null));


export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [dbListings, setDbListings] = useState<{ id: string; user_id: string; data: Artwork; moderation_status: string; created_at?: string }[]>([]);
  const [ownListings, setOwnListings] = useState<Artwork[]>([]);
  const [reviewNotifications, setReviewNotifications] = useState<AppNotification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [dbBids, setDbBids] = useState<Bid[]>([]);
  const [follows, setFollows] = useState<{ artist_id: string; created_at: string; last_seen_at: string }[]>([]);
  const loadFollows = useCallback(async () => {
    if (!userId) { setFollows([]); return; }
    const { data } = await supabase.from("artist_follows").select("artist_id,created_at,last_seen_at").eq("follower_id", userId);
    setFollows(data ?? []);
  }, [userId]);
  useEffect(() => { void loadFollows(); }, [loadFollows]);

  const loadBids = useCallback(async () => {
    if (!userId) { setDbBids([]); return; }
    const { data, error } = await supabase.from("bids").select("*").order("created_at", { ascending: false });
    if (error) return;
    setDbBids((data ?? []).map((b) => ({
      id: b.id, artworkId: b.listing_id, amount: Number(b.amount),
      message: b.message ?? undefined, status: b.status === "accepted" ? "Godtatt" : b.status === "rejected" ? "Avslått" : "Sendt", createdAt: new Date(b.created_at).getTime(),
      buyerId: b.buyer_id, sellerId: b.seller_id, conversationId: b.conversation_id ?? undefined, read: Boolean(b.read_at),
    })));
  }, [userId]);

  useEffect(() => {
    setDbBids([]);
    void loadBids();
    if (!userId) return;
    const channel = supabase.channel(`bids-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bids" }, () => { void loadBids(); })
      .subscribe((status) => { if (status === "SUBSCRIBED") void loadBids(); });
    const refresh = () => { void loadBids(); };
    window.addEventListener("focus", refresh);
    return () => { void supabase.removeChannel(channel); window.removeEventListener("focus", refresh); };
  }, [userId, loadBids]);

  const loadListings = useCallback(async () => {
    const { data, error } = await supabase
      .from("listings")
      .select("id,user_id,data,created_at,moderation_status")
      .eq('moderation_status','published')
      .is('deleted_at',null).eq('blocked',false)
      .order("created_at", { ascending: false });
    if (error) console.error("listings", error);
    else {
      const {data:sold}=await supabase.rpc('unavailable_artwork_ids');
      const unavailable=new Set(sold??[]);
      setDbListings((data??[]).filter(l=>!unavailable.has(l.id)).map(l=>({...l,data:{...(l.data as unknown as Artwork),id:l.id,sellerId:l.user_id}})));
    }
  }, []);

  const loadOwnListings = useCallback(async () => {
    if(!userId) {setOwnListings([]);setReviewNotifications([]);return;}
    const [listings,revisions,events] = await Promise.all([
      supabase.from('listings').select('id,data,moderation_status').eq('user_id',userId).is('deleted_at',null),
      supabase.from('listing_revisions').select('*').eq('user_id',userId).order('created_at',{ascending:false}),
      supabase.from('listing_review_events').select('*').eq('user_id',userId).neq('decision','submitted').order('created_at',{ascending:false}),
    ]);
    setOwnListings((listings.data??[]).map(l=>{
      const rs=(revisions.data??[]).filter(r=>r.listing_id===l.id);
      const r=rs.find(r=>['draft','pending','changes_requested'].includes(r.status))??rs[0];
      return {...((r && !['published','withdrawn','sold'].includes(r.status)?r.data:l.data) as unknown as Artwork),id:l.id,sellerId:userId,moderationStatus:['sold','withdrawn'].includes(l.moderation_status)?l.moderation_status:r?.status??l.moderation_status,...(r?{sellerMessage:r.seller_message,revisionId:r.id,revisionVersion:r.version}:{})};
    }));
    setReviewNotifications((events.data??[]).map(e=>({id:e.id,title:e.decision==='published'?'Annonsen er publisert':e.decision==='changes_requested'?'Endringer kreves':'Annonsen er avslått',body:`«${e.title}»${e.reason?`: ${e.reason}`:''}`,read:Boolean(e.read_at),createdAt:new Date(e.created_at).getTime()})));
  },[userId]);
  useEffect(()=>{void loadOwnListings();const t=setInterval(()=>void loadOwnListings(),15000);return()=>clearInterval(t);},[loadOwnListings]);

  useEffect(() => {
    void loadListings();
    const timer=setInterval(()=>void loadListings(),15000);
    void supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => { clearInterval(timer); sub.subscription.unsubscribe(); };
  }, [loadListings]);

  const [libraryLoaded,setLibraryLoaded]=useState(false);
  useEffect(()=>{
    let alive=true;setState(initialState);setLibraryLoaded(false);
    if(!userId)return;
    void supabase.from('account_library').select('data').eq('user_id',userId).maybeSingle().then(({data,error})=>{
      if(!alive||error)return;
      const d=(data?.data??{}) as Partial<State>;
      setState({...initialState,favorites:d.favorites??[],collections:d.collections??{},savedSearches:d.savedSearches??[],followedArtists:d.followedArtists??[],followedSellers:d.followedSellers??[]});setLibraryLoaded(true);
    });return()=>{alive=false;};
  },[userId]);
  useEffect(()=>{
    if(!userId||!libraryLoaded)return;
    const t=setTimeout(()=>{void supabase.from('account_library').upsert({user_id:userId,data:{favorites:state.favorites,collections:state.collections,savedSearches:state.savedSearches,followedArtists:state.followedArtists,followedSellers:state.followedSellers},updated_at:new Date().toISOString()}).then(({error})=>{if(error)console.error('Library save failed',error);});},400);
    return()=>clearTimeout(t);
  },[userId,libraryLoaded,state.favorites,state.collections,state.savedSearches,state.followedArtists,state.followedSellers]);

  const notify = useCallback((title: string, body: string) => {
    setState((s) => ({
      ...s,
      notifications: [
        { id: `n${Date.now()}`, title, body, read: false, createdAt: Date.now() },
        ...s.notifications,
      ],
    }));
  }, []);

  const value = useMemo<Store>(
    () => ({
      ...state,
      bids: dbBids,
      followedSellers: follows.map(f=>f.artist_id),
      notifications: [...reviewNotifications, ...dbBids.filter((b) => b.sellerId === userId).map((b) => ({
        id: b.id, title: "Nytt bud mottatt", body: `${Number(b.amount).toLocaleString("nb-NO")} kr på «${dbListings.find((l) => l.id === b.artworkId)?.data.title ?? "kunstverk"}»`,
        read: b.read ?? false, createdAt: b.createdAt, conversationId: b.conversationId,
      })), ...dbListings.flatMap((l) => {
        const f = follows.find((x) => x.artist_id === l.user_id);
        if (!f || !l.created_at || l.created_at <= f.created_at) return [];
        return [{ id: `nw-${l.id}`, title: "Nytt verk fra en kunstner du følger", body: `«${l.data.title}»`, read: l.created_at <= f.last_seen_at, createdAt: new Date(l.created_at).getTime(), slug: l.data.slug }];
      }), ...state.notifications].sort((a, b) => b.createdAt - a.createdAt),
      myListings: ownListings,
      allArtworks: [...dbListings.map((l) => l.data), ...demoArtworks],
      isFavorite: (id) => state.favorites.includes(id),
      toggleFavorite: (id) => {
        if(!userId)return notify("Innlogging kreves","Logg inn for å lagre favoritter.");
        setState((s) => ({
          ...s,
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        }));
      },
      createCollection: (name) =>
        setState((s) => ({ ...s, collections: { ...s.collections, [name]: s.collections[name] ?? [] } })),
      addToCollection: (name, id) =>
        setState((s) => {
          const current = s.collections[name] ?? [];
          return {
            ...s,
            favorites: s.favorites.includes(id) ? s.favorites : [...s.favorites, id],
            collections: {
              ...s.collections,
              [name]: current.includes(id) ? current : [...current, id],
            },
          };
        }),
      toggleFollowArtist: (id) =>
        setState((s) => ({
          ...s,
          followedArtists: s.followedArtists.includes(id)
            ? s.followedArtists.filter((f) => f !== id)
            : [...s.followedArtists, id],
        })),
      toggleFollowSeller: (id) => {
        if(!userId)return notify('Innlogging kreves','Logg inn for å følge kunstnere.');
        void (async()=>{const result=follows.some(f=>f.artist_id===id)?await supabase.from('artist_follows').delete().eq('follower_id',userId).eq('artist_id',id):await supabase.from('artist_follows').insert({artist_id:id});if(result.error)return notify('Kunne ikke følge','Prøv igjen.');await loadFollows();})();
      },
      placeBid: async (artworkId, amount, message) => {
        if (!userId) throw new Error("Logg inn for å gi bud.");
        if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000000) throw new Error("Skriv inn et gyldig beløp.");
        const { error } = await supabase.rpc("submit_artwork_bid", { _listing_id: artworkId, _amount: amount, _message: message ?? "" });
        if (error) throw new Error("Budet kunne ikke sendes. Du kan ikke by på din egen annonse. Prøv igjen.");
        void notifySeller({ data: { kind: "bid", listingId: artworkId } }).catch(() => {});
        await loadBids();
      },
      markBidRead: async (id) => {
        const { error } = await supabase.from("bids").update({ read_at: new Date().toISOString() }).eq("id", id);
        if (!error) await loadBids();
      },
      decideBid: async (id, decision) => {
        const { error } = await supabase.rpc("decide_artwork_bid", { _bid_id: id, _decision: decision });
        if (error) throw new Error("Budet kunne ikke behandles. Det kan allerede være besvart. Prøv igjen.");
        await loadBids();
      },
      sendMessage: (artworkId, text) =>
        setState((s) => {
          const msg: ChatMessage = { id: `m${Date.now()}`, from: "meg", text, createdAt: Date.now() };
          const existing = s.conversations.find((c) => c.artworkId === artworkId);
          return {
            ...s,
            conversations: existing
              ? s.conversations.map((c) =>
                  c.artworkId === artworkId ? { ...c, messages: [...c.messages, msg] } : c,
                )
              : [{ id: `c${Date.now()}`, artworkId, messages: [msg] }, ...s.conversations],
          };
        }),
      saveSearch: (query, label) => {
        setState((s) => ({
          ...s,
          savedSearches: [{ id: `ss${Date.now()}`, query, label }, ...s.savedSearches],
        }));
        notify("Søk lagret", `Du finner «${label}» under lagrede søk.`);
      },
      markAllRead: () => {
        void supabase.rpc('mark_review_events_read').then(()=>loadOwnListings());
        setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
        if (userId) void supabase.from("artist_follows").update({ last_seen_at: new Date().toISOString() }).eq("follower_id", userId).then(() => loadFollows());
        if (userId) void supabase.from("bids").update({ read_at: new Date().toISOString() }).eq("seller_id", userId).is("read_at", null).then(() => loadBids());
      },
      addListing: async (a, draft = false) => {
        if(!userId)throw new Error('Logg inn for å publisere.');
        const fees=priceFromPayout(a.sellerPayout??0,a.artFeeApplies??true);
        if(!a.title.trim()||!a.image||(!draft&&!fees.total&&a.saleType!=='Pris på forespørsel'))throw new Error('Sjekk bilde, tittel og pris.');
        await saveListingDraft({data:{listing:{...a,sellerId:userId,price:fees.total} as never}});
        if(!draft){const result=await submitListing({data:{id:a.id}});if(result.eventId){try{const notice=await sendReviewNotice({data:{eventId:result.eventId}});if(notice.status==='failed')notify('E-postvarsel venter','Annonsen ligger i godkjenningskøen. E-postvarselet kan sendes på nytt fra administrasjonen.');}catch{notify('E-postvarsel venter','Annonsen er sendt inn. E-postvarselet kan sendes på nytt fra administrasjonen.');}}notify('Sendt til godkjenning',submissionConfirmation);}
        await Promise.all([loadListings(),loadOwnListings()]);
      },
      updateListing: async (a) => {
        await saveListingDraft({data:{listing:a as never}});await Promise.all([loadListings(),loadOwnListings()]);
      },
      submitListing:async(id)=>{const r=await submitListing({data:{id}});if(r.eventId){try{await sendReviewNotice({data:{eventId:r.eventId}});}catch{notify('E-postvarsel venter','Annonsen er sendt inn; e-postvarselet kan sendes på nytt.');}}notify('Sendt til godkjenning',submissionConfirmation);await loadOwnListings();},
      changeVisibility:async(id,action)=>{await changeListingVisibility({data:{id,action}});await Promise.all([loadListings(),loadOwnListings()]);},
      deleteListing: async (id) => {
        await changeListingVisibility({data:{id,action:'delete'}});await Promise.all([loadListings(),loadOwnListings()]);
      },
    }),
    [state, notify, dbListings, dbBids, userId, loadListings, loadBids, follows, loadFollows,ownListings,reviewNotifications,loadOwnListings],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
