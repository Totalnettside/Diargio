import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/data/demo";
import { useStore } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { UnreadBadge } from "@/components/UnreadBadge";

export const Route = createFileRoute("/meldinger")({
  validateSearch: (search: Record<string, unknown>): { c?: string } => typeof search["c"] === "string" ? { c: search["c"] } : {},
  head: () => ({
    meta: [
      { title: "Meldinger | Diargio" },
      { name: "description", content: "Samtaler med kjøpere og selgere, koblet til kunstverket." },
      { property: "og:title", content: "Meldinger | Diargio" },
      { property: "og:description", content: "Send meldinger direkte til kjøpere og selgere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { user, loading } = useAuth();
  const { allArtworks, bids, markBidRead } = useStore();
  const { c } = Route.useSearch();
  const { conversations, messages, names, unreadFor, send, markRead } = useChat();
  const [activeId, setActiveId] = useState("");
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
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
    endRef.current?.scrollIntoView({ block: "end" });
  }, [thread.length]);

  if (!loading && !user) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-10 text-center">
        <h1 className="font-display text-2xl font-semibold">Meldinger</h1>
        <p className="mt-2 text-sm text-ink/60">Logg inn for å se meldingene dine.</p>
        <Link to="/auth" className="mt-4 inline-block rounded-2xl bg-brandink px-6 py-3 text-sm font-semibold text-primary-foreground">
          Logg inn
        </Link>
      </main>
    );
  }

  if (conversations.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-10 text-center">
        <h1 className="font-display text-2xl font-semibold">Meldinger</h1>
        <p className="mt-2 text-sm text-ink/60">Du har ingen samtaler ennå. Kontakt en selger fra en annonse.</p>
        <Link to="/kunst" className="mt-4 inline-block rounded-2xl bg-brandink px-6 py-3 text-sm font-semibold text-primary-foreground">
          Utforsk kunst
        </Link>
      </main>
    );
  }

  const otherName = (c: (typeof conversations)[number]) =>
    names[c.buyer_id === user?.id ? c.seller_id : c.buyer_id] ?? "Bruker";

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-5">
      <h1 className="font-display text-2xl font-semibold">Meldinger</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-[300px_1fr]">
        <aside className="space-y-2">
          {conversations.map((c) => {
            const art = allArtworks.find((a) => a.id === c.listing_id);
            const last = messages.filter((m) => m.conversation_id === c.id).at(-1);
            const n = unreadFor(c.id);
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left glass ${c.id === active?.id ? "bg-lav/50" : ""}`}
              >
                {art && <img src={art.image} alt={art.title} loading="lazy" className="size-12 rounded-xl object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${n ? "font-bold" : "font-semibold"}`}>{otherName(c)}</p>
                  <p className="truncate text-xs text-ink/55">{art?.title}</p>
                  <p className={`truncate text-xs ${n ? "font-semibold text-ink" : "text-ink/55"}`}>{last?.body}</p>
                </div>
                <UnreadBadge count={n} />
              </button>
            );
          })}
        </aside>

        <section className="flex flex-col rounded-3xl p-4 glass">
          {artwork && (
            <Link to="/kunst/$slug" params={{ slug: artwork.slug }} className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 glass">
              <img src={artwork.image} alt={artwork.title} loading="lazy" className="size-14 rounded-xl object-cover" />
              <div>
                <p className="text-sm font-semibold">{artwork.title}</p>
                <p className="text-xs text-ink/55">{formatPrice(artwork.price)}</p>
                {active && <p className="text-xs text-ink/45">Samtale med {otherName(active)}</p>}
              </div>
            </Link>
          )}

          <div className="mt-4 max-h-[55vh] space-y-2 overflow-y-auto">
            {thread.map((m) => {
              const mine = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${mine ? "ml-auto bg-brandink text-primary-foreground" : "bg-white/80 glass"}`}>
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className="mt-1 text-[10px] opacity-60">
                    {new Date(m.created_at).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}
                    {mine && m.read_at ? " · Sett" : ""}
                  </p>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <form
            className="mt-4 flex gap-2"
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
              className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none glass"
            />
            <button className="rounded-2xl bg-brandink px-5 py-3 text-sm font-semibold text-primary-foreground">Send</button>
          </form>
        </section>
      </div>
    </main>
  );
}
