import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { artistById, formatPrice } from "@/data/demo";
import { useStore } from "@/lib/store";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dealroom/$slug")({
  head: () => ({
    meta: [
      { title: "Dealroom | Diargio" },
      { name: "description", content: "Virtuelt dealroom der kjøper og selger ser verket, chatter og gir bud." },
      { property: "og:title", content: "Dealroom | Diargio" },
      { property: "og:description", content: "Se verket tett på, chat og forhandle i samme rom." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DealRoom,
});

function DealRoom() {
  const { slug } = Route.useParams();
  const { allArtworks, bids, placeBid } = useStore();
  const { conversations, messages, names, send, startConversation } = useChat();
  const { user } = useAuth();
  const artwork = allArtworks.find((a) => a.slug === slug);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [text, setText] = useState("");
  const [bid, setBid] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const convo = conversations.find((c) => c.listing_id === artwork?.id);
  const thread = messages.filter((m) => m.conversation_id === convo?.id);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [thread.length]);

  if (!artwork) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Fant ikke verket</h1>
        <Link to="/kunst" className="mt-4 inline-block text-brandink underline">Tilbake til kunst</Link>
      </main>
    );
  }

  const highest = bids.filter((b) => b.artworkId === artwork.id).reduce((m, b) => Math.max(m, b.amount), 0);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand">Dealroom</p>
          <h1 className="font-display text-2xl font-semibold">{artwork.title}</h1>
          <p className="text-sm text-ink/60">
            {convo ? `Kjøper: ${names[convo.buyer_id] ?? "Kjøper"} · Selger: ${names[convo.seller_id] ?? "Selger"}` : "Kjøp og salg av kunst"}
          </p>
        </div>
        <Link to="/kunst/$slug" params={{ slug }} className="text-sm font-semibold text-brandink underline">
          Til annonsen
        </Link>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Bildewisning */}
        <section className="relative overflow-hidden rounded-3xl bg-ink">
          <div
            className="flex h-[460px] cursor-grab touch-none items-center justify-center overflow-hidden active:cursor-grabbing md:h-[560px]"
            onPointerDown={(e) => {
              drag.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!drag.current) return;
              setPan({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
            }}
            onPointerUp={() => (drag.current = null)}
            onWheel={(e) => setZoom((z) => Math.max(1, Math.min(3, z - e.deltaY * 0.001)))}
          >
            <img
              src={artwork.image}
              alt={artwork.title}
              draggable={false}
              className="max-h-full max-w-full select-none object-contain shadow-2xl"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
            />
          </div>
          <div className="absolute bottom-3 left-3 flex gap-2">
            {[
              { i: ZoomIn, f: () => setZoom((z) => Math.min(3, z + 0.3)), l: "Zoom inn" },
              { i: ZoomOut, f: () => setZoom((z) => { const n = Math.max(1, z - 0.3); if (n === 1) setPan({ x: 0, y: 0 }); return n; }), l: "Zoom ut" },
            ].map(({ i: Icon, f, l }) => (
              <button key={l} onClick={f} aria-label={l} className="rounded-xl bg-mist/90 p-2 text-ink">
                <Icon className="size-4" />
              </button>
            ))}
          </div>
          <p className="absolute right-3 top-3 rounded-full bg-mist/90 px-3 py-1 text-xs text-ink">
            Dra for å flytte · scroll for zoom
          </p>
        </section>

        {/* Chat + bud */}
        <section className="flex flex-col rounded-3xl p-4 glass">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-2xl bg-white/70 p-3">
              <p className="text-xs text-ink/55">Prisantydning</p>
              <p className="font-semibold">{formatPrice(artwork.price)}</p>
            </div>
            <div className="rounded-2xl bg-white/70 p-3">
              <p className="text-xs text-ink/55">Høyeste bud</p>
              <p className="font-semibold">{highest ? formatPrice(highest) : "–"}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-ink/55">
            {artistById(artwork.artistId)?.name} · {artwork.location}
          </p>

          <div className="mt-3 h-72 flex-1 space-y-2 overflow-y-auto pr-1">
            {!thread.length && (
              <p className="text-sm text-ink/55">Start forhandlingen med en melding eller et bud.</p>
            )}
            {thread.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  m.sender_id === user?.id ? "ml-auto bg-brandink text-primary-foreground" : "bg-card/80"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
          <form
            className="mt-3 flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const n = Number(bid);
              if (!n) return;
              setSending(true); setError("");
              try { await placeBid(artwork.id, n); setBid(""); }
              catch (e) { setError(e instanceof Error ? e.message : "Budet kunne ikke sendes."); }
              finally { setSending(false); }
            }}
          >
            <input
              type="number"
              value={bid}
              onChange={(e) => setBid(e.target.value)}
              placeholder="Beløp i kr"
              className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none"
            />
            <Button type="submit" disabled={sending} variant="secondary" className="shrink-0">{sending ? "Sender …" : "Gi bud"}</Button>
          </form>
          <form
            className="mt-2 flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!text.trim()) return;
              setSending(true); setError("");
              try {
                if (!user) throw new Error("Logg inn for å sende melding.");
                if (convo) await send(convo.id, text.trim());
                else if (!await startConversation(artwork.id, text.trim())) throw new Error("Samtalen kunne ikke åpnes.");
                setText("");
              } catch (e) { setError(e instanceof Error ? e.message : "Meldingen kunne ikke sendes."); }
              finally { setSending(false); }
            }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Skriv en melding …"
              className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none"
            />
            <Button type="submit" disabled={sending} className="shrink-0">
              Send
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
