import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Artwork } from "@/data/demo";
import { artworks as demoArtworks } from "@/data/demo";

export type Bid = {
  id: string;
  artworkId: string;
  amount: number;
  message?: string;
  status: "Sendt" | "Godtatt" | "Avslått" | "Motbud";
  counterAmount?: number;
  createdAt: number;
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
  favorites: ["w1", "w4"],
  collections: { "Kunst jeg vurderer": ["w1"], "Til kontoret": ["w4"] },
  followedArtists: ["a1"],
  followedSellers: [],
  bids: [],
  conversations: [
    {
      id: "c1",
      artworkId: "w4",
      messages: [
        { id: "m1", from: "meg", text: "Hei! Er verket fortsatt tilgjengelig?", createdAt: Date.now() - 86400000 },
        { id: "m2", from: "selger", text: "Ja, det henger fortsatt i galleriet. Du er velkommen innom.", createdAt: Date.now() - 82000000 },
      ],
    },
    {
      id: "c2",
      artworkId: "w2",
      messages: [
        { id: "m3", from: "selger", text: "Takk for interessen – gi gjerne et bud.", createdAt: Date.now() - 3600000 },
      ],
    },
  ],
  savedSearches: [{ id: "ss1", query: "pushwagner", label: "Pushwagner under 100 000 kr" }],
  notifications: [
    { id: "n1", title: "Nytt bud", body: "Du har fått et bud på «Fjordlys».", read: false, createdAt: Date.now() - 5400000 },
    { id: "n2", title: "Ny melding", body: "Galleri Fineart svarte på meldingen din.", read: false, createdAt: Date.now() - 82000000 },
    { id: "n3", title: "Lagret søk", body: "3 nye treff på «Pushwagner».", read: true, createdAt: Date.now() - 172800000 },
  ],
  myListings: [],
};

type Store = State & {
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  addToCollection: (name: string, id: string) => void;
  createCollection: (name: string) => void;
  toggleFollowArtist: (id: string) => void;
  toggleFollowSeller: (id: string) => void;
  placeBid: (artworkId: string, amount: number, message?: string) => void;
  sendMessage: (artworkId: string, text: string) => void;
  saveSearch: (query: string, label: string) => void;
  markAllRead: () => void;
  addListing: (a: Artwork) => void;
  allArtworks: Artwork[];
};

const StoreContext = createContext<Store | null>(null);
const KEY = "diargio-state-v1";
const LEGACY_KEY = "geargio-state-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
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
      allArtworks: [...state.myListings, ...demoArtworks],
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
      placeBid: (artworkId, amount, message) => {
        const bid: Bid = {
          id: `b${Date.now()}`,
          artworkId,
          amount,
          ...(message ? { message } : {}),
          status: "Sendt",
          createdAt: Date.now(),
        };
        setState((s) => {
          const existing = s.conversations.find((c) => c.artworkId === artworkId);
          const bidMsg: ChatMessage = {
            id: `m${Date.now()}`,
            from: "meg",
            bidAmount: amount,
            ...(message ? { text: message } : {}),
            createdAt: Date.now(),
          };
          const conversations = existing
            ? s.conversations.map((c) =>
                c.artworkId === artworkId ? { ...c, messages: [...c.messages, bidMsg] } : c,
              )
            : [{ id: `c${Date.now()}`, artworkId, messages: [bidMsg] }, ...s.conversations];
          return { ...s, bids: [bid, ...s.bids], conversations };
        });
        notify("Bud sendt", `Budet ditt er sendt til selger.`);
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
      markAllRead: () =>
        setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      addListing: (a) => {
        setState((s) => ({ ...s, myListings: [a, ...s.myListings] }));
        notify("Annonse publisert", `«${a.title}» er nå synlig på markedsplassen.`);
      },
    }),
    [state, notify],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
