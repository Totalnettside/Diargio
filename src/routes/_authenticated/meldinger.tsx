import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/data/demo";
import { useStore } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { UnreadBadge } from "@/components/UnreadBadge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, MessageCircle, Send } from "lucide-react";
import { privateHead, privatePageFor } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/meldinger")({
  validateSearch: (search: Record<string, unknown>): { c?: string } => typeof search["c"] === "string" ? { c: search["c"] } : {},
  head: () => {
    const page = privatePageFor("/meldinger");
    return { ...privateHead(page.title, page.description), links: [{ rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&display=swap" }] };
  },
  component: MessagesPage,
});

function MessagesPage() {
  const { user, loading } = useAuth();
  const { allArtworks, bids, markBidRead } = useStore();
  const { c } = Route.useSearch();
  const { conversations, messages, names, unreadFor, send, markRead } = useChat();
  const [activeId, setActiveId] = useState("");
  const [text, setText] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);
  const active = conversations.find((conversation) => conversation.id === (activeId || c)) ?? conversations[0];
  const thread = active ? messages.filter((m) => m.conversation_id === active.id) : [];
  const artwork = active ? allArtworks.find((a) => a.id === active.listing_id) : undefined;
  const activeUnread = active ? unreadFor(active.id) : 0;

  useEffect(() => {
    if (active && activeUnread > 0) void markRead(active.id);
  }, [active, activeUnread, markRead]);

  useEffect(() => {
    const unread = bids.filter((b) => b.conversationId === active?.id && b.sellerId === user?.id && !b.read);
    for (const b of unread) void markBidRead(b.id);
  }, [active?.id, bids, user?.id, markBidRead]);

  useEffect(() => {
    const container = threadRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [active?.id, thread.length]);

  if (!loading && !user) {
    return (
      <main className="messages-page mx-auto w-full max-w-3xl px-5 py-16 text-center">
        <MessageCircle className="mx-auto mb-5 size-8 text-primary" />
        <h1 className="messages-title text-3xl font-semibold">Meldinger</h1>
        <p className="mt-2 text-sm text-ink/60">Logg inn for å se meldingene dine.</p>
        <Button asChild className="mt-6"><Link to="/auth">
          Logg inn
        </Link></Button>
      </main>
    );
  }

  if (conversations.length === 0) {
    return (
      <main className="messages-page mx-auto w-full max-w-3xl px-5 py-16 text-center">
        <MessageCircle className="mx-auto mb-5 size-8 text-primary" />
        <h1 className="messages-title text-3xl font-semibold">Meldinger</h1>
        <p className="mt-2 text-sm text-ink/60">Du har ingen samtaler ennå. Kontakt en selger fra en annonse.</p>
        <Button asChild className="mt-6"><Link to="/kunst">
          Utforsk kunst
        </Link></Button>
      </main>
    );
  }

  const otherName = (c: (typeof conversations)[number]) =>
    names[c.buyer_id === user?.id ? c.seller_id : c.buyer_id] ?? "Bruker";

  return (
    <main className="messages-page mx-auto w-full max-w-6xl px-4 py-8 md:px-5 md:py-10">
      <h1 className="messages-title text-3xl font-semibold">Meldinger</h1>
      <div className="messages-workspace mt-6 grid items-start gap-6 md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside aria-label="Samtaler" className="messages-list flex min-w-0 flex-col gap-3 overflow-y-auto">
          {conversations.map((c) => {
            const art = allArtworks.find((a) => a.id === c.listing_id);
            const last = messages.filter((m) => m.conversation_id === c.id).at(-1);
            const n = unreadFor(c.id);
            return (
              <Button
                variant="ghost"
                key={c.id}
                onClick={() => setActiveId(c.id)}
                aria-pressed={c.id === active?.id}
                className={`messages-conversation h-auto w-full shrink-0 justify-start gap-4 whitespace-normal rounded-2xl border p-4 text-left ${c.id === active?.id ? "is-active" : ""}`}
              >
                {art ? <img src={art.image} alt={art.title} loading="lazy" className="messages-thumbnail size-14 shrink-0 rounded-xl object-contain" /> : <MessageCircle className="size-14 shrink-0 p-3 text-muted-foreground" />}
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${n ? "font-bold" : "font-semibold"}`}>{otherName(c)}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{art?.title}</p>
                  <p className={`mt-1.5 truncate text-xs ${n || c.id === active?.id ? "font-semibold text-primary" : "text-muted-foreground"}`}>{last?.body}</p>
                </div>
                <UnreadBadge count={n} />
              </Button>
            );
          })}
        </aside>

        <section aria-label="Aktiv samtale" className="messages-chat flex min-w-0 flex-col overflow-hidden rounded-[2rem] border">
          {artwork && (
            <Link to="/kunst/$slug" params={{ slug: artwork.slug }} className="messages-context flex shrink-0 items-center gap-4 border-b p-5 transition-colors">
              <img src={artwork.image} alt={artwork.title} loading="lazy" className="messages-thumbnail size-16 shrink-0 rounded-xl object-contain" />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-semibold">{artwork.title}</h2>
                <p className="mt-0.5 text-sm font-bold text-primary">{formatPrice(artwork.price)}</p>
                {active && <p className="mt-1 text-xs text-muted-foreground">Samtale med {otherName(active)}</p>}
              </div>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          )}

          <div ref={threadRef} role="log" aria-label="Meldinger i samtalen" className="messages-thread flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-5 md:p-8">
            {thread.map((m) => {
              const mine = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`flex flex-col gap-1.5 ${mine ? "items-end" : "items-start"}`}>
                  <div className={`messages-bubble max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed md:max-w-[75%] ${mine ? "messages-bubble-sent rounded-tr-none" : "messages-bubble-received rounded-tl-none border"}`}>
                    <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{m.body}</p>
                  </div>
                  <p className="px-1 text-[10px] text-muted-foreground">
                    {new Date(m.created_at).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}
                    {mine && m.read_at ? " · Sett" : ""}
                  </p>
                </div>
              );
            })}
          </div>

          <form
            className="messages-compose mx-5 mb-5 flex shrink-0 items-center gap-2 rounded-2xl border p-2 md:mx-6 md:mb-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim() || !active) return;
              void send(active.id, text.trim());
              setText("");
            }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Skriv en melding …"
              aria-label="Skriv en melding"
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" disabled={!text.trim() || !active} className="messages-send h-11 shrink-0 rounded-xl px-4 font-semibold md:px-6"><Send /><span>Send</span></Button>
          </form>
        </section>
      </div>
    </main>
  );
}
