import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { artistById, formatPrice, sellerById } from "@/data/demo";
import { useStore } from "@/lib/store";

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
  const { allArtworks, conversations, sendMessage, placeBid } = useStore();
  const artwork = allArtworks.find((a) => a.slug === slug);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [text, setText] = useState("");
  const [bid, setBid] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const convo = conversations.find((c) => c.artworkId === artwork?.id);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [convo?.messages.length]);

  if (!artwork) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Fant ikke verket</h1>
        <Link to="/kunst" className="mt-4 inline-block text-brandink underline">Tilbake til kunst</Link>
      </main>
    );
  }

  const bids = convo?.messages.filter((m) => m.bidAmount) ?? [];
  const highest = bids.reduce((m, b) => Math.max(m, b.bidAmount ?? 0), 0);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand">Dealroom</p>
          <h1 className="font-display text-2xl font-semibold">{artwork.title}</h1>
          <p className="text-sm text-ink/60">
            Kjøper: deg · Selger: {sellerById(artwork.sellerId).name}
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
            {artistById(artwork.artistId).name} · {artwork.location}
          </p>

          <div className="mt-3 h-72 flex-1 space-y-2 overflow-y-auto pr-1">
            {!convo?.messages.length && (
              <p className="text-sm text-ink/55">Start forhandlingen med en melding eller et bud.</p>
            )}
            {convo?.messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  m.from === "meg" ? "ml-auto bg-brandink text-primary-foreground" : "bg-white/80"
                }`}
              >
                {m.bidAmount && <p className="font-semibold">Bud: {formatPrice(m.bidAmount)}</p>}
                {m.text && <p>{m.text}</p>}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const n = Number(bid);
              if (!n) return;
              placeBid(artwork.id, n);
              setBid("");
            }}
          >
            <input
              type="number"
              value={bid}
              onChange={(e) => setBid(e.target.value)}
              placeholder="Beløp i kr"
              className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none"
            />
            <button className="shrink-0 rounded-2xl bg-lav/80 px-4 py-3 text-sm font-semibold text-brandink">
              Gi bud
            </button>
          </form>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              sendMessage(artwork.id, text.trim());
              setText("");
            }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Skriv en melding …"
              className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none"
            />
            <button className="shrink-0 rounded-2xl bg-brandink px-4 py-3 text-sm font-semibold text-primary-foreground">
              Send
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
