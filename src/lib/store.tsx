import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode, type Context } from "react";
import type { Artwork } from "@/data/demo";
import { artworks as demoArtworks } from "@/data/demo";
import { supabase } from "@/integrations/supabase/client";

export type Bid = {
  id: string;
  artworkId: string;
  amount: number;
  message?: string;
  status: "Sendt" | "Godtatt" | "Avslått" | "Motbud";
  counterAmount?: number;
  createdAt: number;
  buyerId?: string;
  sellerId?: string;
  conversationId?: string;
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
  conversationId?: string;
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
  sendMessage: (artworkId: string, text: string) => void;
  saveSearch: (query: string, label: string) => void;
  markAllRead: () => void;
  addListing: (a: Artwork) => void;
  updateListing: (a: Artwork) => void;
  deleteListing: (id: string) => void;
  allArtworks: Artwork[];
};

const g = globalThis as unknown as { __diargioStoreCtx?: Context<Store | null> };
const StoreContext = g.__diargioStoreCtx ?? (g.__diargioStoreCtx = createContext<Store | null>(null));
const KEY = "diargio-state-v2";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [dbListings, setDbListings] = useState<{ id: string; user_id: string; data: Artwork }[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [dbBids, setDbBids] = useState<Bid[]>([]);

  const loadBids = useCallback(async () => {
    if (!userId) { setDbBids([]); return; }
    const { data, error } = await supabase.from("bids").select("*").order("created_at", { ascending: false });
    if (error) return;
    setDbBids((data ?? []).map((b) => ({
      id: b.id, artworkId: b.listing_id, amount: Number(b.amount),
      message: b.message ?? undefined, status: "Sendt", createdAt: new Date(b.created_at).getTime(),
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
      .select("id,user_id,data")
      .order("created_at", { ascending: false });
    if (error) console.error("listings", error);
    else setDbListings((data ?? []) as unknown as { id: string; user_id: string; data: Artwork }[]);
  }, []);

  useEffect(() => {
    void loadListings();
    void supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadListings]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as State) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

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
      notifications: [...dbBids.filter((b) => b.sellerId === userId).map((b) => ({
        id: b.id, title: "Nytt bud mottatt", body: `${Number(b.amount).toLocaleString("nb-NO")} kr på «${dbListings.find((l) => l.id === b.artworkId)?.data.title ?? "kunstverk"}»`,
        read: b.read ?? false, createdAt: b.createdAt, conversationId: b.conversationId,
      })), ...state.notifications].sort((a, b) => b.createdAt - a.createdAt),
      myListings: dbListings.filter((l) => l.user_id === userId).map((l) => l.data),
      allArtworks: [...dbListings.map((l) => l.data), ...demoArtworks],
      isFavorite: (id) => state.favorites.includes(id),
      toggleFavorite: (id) =>
        setState((s) => ({
          ...s,
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
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
      toggleFollowSeller: (id) =>
        setState((s) => ({
          ...s,
          followedSellers: s.followedSellers.includes(id)
            ? s.followedSellers.filter((f) => f !== id)
            : [...s.followedSellers, id],
        })),
      placeBid: async (artworkId, amount, message) => {
        if (!userId) throw new Error("Logg inn for å gi bud.");
        if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000000) throw new Error("Skriv inn et gyldig beløp.");
        const { error } = await supabase.rpc("submit_artwork_bid", { _listing_id: artworkId, _amount: amount, _message: message ?? "" });
        if (error) throw new Error("Budet kunne ikke sendes. Du kan ikke by på din egen annonse. Prøv igjen.");
        await loadBids();
      },
      markBidRead: async (id) => {
        const { error } = await supabase.from("bids").update({ read_at: new Date().toISOString() }).eq("id", id);
        if (!error) await loadBids();
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
        notify("Søk lagret", `Du får varsel når nye verk matcher «${label}».`);
      },
      markAllRead: () => {
        setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
        if (userId) void supabase.from("bids").update({ read_at: new Date().toISOString() }).eq("seller_id", userId).is("read_at", null).then(() => loadBids());
      },
      addListing: (a) => {
        void (async () => {
          const { error } = await supabase.from("listings").insert({ id: a.id, data: a as never });
          if (error) {
            notify("Kunne ikke publisere", error.message);
            return;
          }
          await loadListings();
          notify("Annonse publisert", `«${a.title}» er nå synlig på markedsplassen.`);
        })();
      },
      updateListing: (a) => {
        void (async () => {
          const { error } = await supabase
            .from("listings")
            .update({ data: a as never, updated_at: new Date().toISOString() })
            .eq("id", a.id);
          if (error) return notify("Kunne ikke lagre", error.message);
          await loadListings();
          notify("Annonse oppdatert", `«${a.title}» er lagret.`);
        })();
      },
      deleteListing: (id) => {
        void (async () => {
          const { error } = await supabase.from("listings").delete().eq("id", id);
          if (error) return notify("Kunne ikke slette", error.message);
          await loadListings();
          notify("Annonse slettet", "Annonsen er fjernet fra markedsplassen.");
        })();
      },
    }),
    [state, notify, dbListings, dbBids, userId, loadListings, loadBids],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
