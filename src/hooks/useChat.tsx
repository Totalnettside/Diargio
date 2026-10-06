import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};
export type ChatConversation = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  updated_at: string;
};

type ChatValue = {
  conversations: ChatConversation[];
  messages: ChatMessage[];
  unread: number;
  unreadFor: (cid: string) => number;
  names: Record<string, string>;
  send: (cid: string, body: string) => Promise<void>;
  markRead: (cid: string) => Promise<void>;
  startConversation: (listingId: string, body: string) => Promise<string | null>;
};

const ChatContext = createContext<ChatValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!uid) {
      setConversations([]);
      setMessages([]);
      return;
    }
    const { data: convs } = await supabase
      .from("conversations")
      .select("id, listing_id, buyer_id, seller_id, updated_at")
      .order("updated_at", { ascending: false });
    const list = convs ?? [];
    setConversations(list);
    if (list.length) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .in("conversation_id", list.map((c) => c.id))
        .order("created_at");
      setMessages(msgs ?? []);
      const ids = [...new Set(list.flatMap((c) => [c.buyer_id, c.seller_id]))];
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, first_name, last_name")
        .in("id", ids);
      const map: Record<string, string> = {};
      for (const p of profs ?? [])
        map[p.id] = [p.first_name, p.last_name].filter(Boolean).join(" ") || p.display_name || "Bruker";
      setNames(map);
    } else setMessages([]);
  }, [uid]);

  useEffect(() => {
    void load();
    if (!uid) return;
    const channel = supabase
      .channel(`chat-${uid}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new as ChatMessage;
        if (payload.eventType === "INSERT") {
          setMessages((prev) => {
            if (prev.some((x) => x.id === m.id)) return prev;
            return [...prev, m];
          });
          setConversations((prev) => {
            if (!prev.some((c) => c.id === m.conversation_id)) {
              void load();
              return prev;
            }
            return prev
              .map((c) => (c.id === m.conversation_id ? { ...c, updated_at: m.created_at } : c))
              .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
          });
        } else if (payload.eventType === "UPDATE") {
          setMessages((prev) => prev.map((x) => (x.id === m.id ? m : x)));
        }
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [uid, load]);

  const value = useMemo<ChatValue>(() => {
    const isUnread = (m: ChatMessage) => !m.read_at && m.sender_id !== uid;
    return {
      conversations,
      messages,
      names,
      unread: messages.filter(isUnread).length,
      unreadFor: (cid) => messages.filter((m) => m.conversation_id === cid && isUnread(m)).length,
      send: async (cid, body) => {
        const { data } = await supabase.from("messages").insert({ conversation_id: cid, body }).select().single();
        if (data) setMessages((prev) => (prev.some((x) => x.id === data.id) ? prev : [...prev, data]));
      },
      markRead: async (cid) => {
        if (!uid) return;
        const now = new Date().toISOString();
        setMessages((prev) => prev.map((m) => (m.conversation_id === cid && isUnread(m) ? { ...m, read_at: now } : m)));
        await supabase
          .from("messages")
          .update({ read_at: now })
          .eq("conversation_id", cid)
          .neq("sender_id", uid)
          .is("read_at", null);
      },
      startConversation: async (listingId, body) => {
        if (!uid) return null;
        const { data: listing } = await supabase.from("listings").select("user_id").eq("id", listingId).maybeSingle();
        if (!listing || listing.user_id === uid) return null;
        let cid = conversations.find((c) => c.listing_id === listingId && c.buyer_id === uid)?.id;
        if (!cid) {
          const { data: existing } = await supabase
            .from("conversations")
            .select("id")
            .eq("listing_id", listingId)
            .eq("buyer_id", uid)
            .maybeSingle();
          cid = existing?.id;
        }
        if (!cid) {
          const { data: created } = await supabase
            .from("conversations")
            .insert({ listing_id: listingId, buyer_id: uid, seller_id: listing.user_id })
            .select("id")
            .single();
          cid = created?.id;
        }
        if (!cid) return null;
        await supabase.from("messages").insert({ conversation_id: cid, body });
        await load();
        return cid;
      },
    };
  }, [conversations, messages, names, uid, load]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
