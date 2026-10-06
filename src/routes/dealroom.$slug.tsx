import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { artistById, formatPrice, sellerById } from "@/data/demo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/dealroom/$slug")({
  head: () => ({
    meta: [
      { title: "Dealroom | Diargio" },
      { name: "description", content: "Virtuelt dealroom der kjøper og selger ser verket, chatter og gir bud." },
      { property: "og:title", content: "Dealroom | Diargio" },
      { property: "og:description", content: "Se verket i 3D, chat og forhandle i samme rom." },
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
  const [rot, setRot] = useState({ x: -6, y: -20 });
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
  const isSculpture = /skulptur/i.test(`${artwork.technique ?? ""} ${artwork.category ?? ""}`);

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
        {/* 3D-visning */}
        <section className="relative overflow-hidden rounded-3xl bg-ink" style={{ perspective: "1400px" }}>
          <div
            className="flex h-[460px] cursor-grab touch-none items-center justify-center active:cursor-grabbing md:h-[560px]"
            onPointerDown={(e) => {
              drag.current = { x: e.clientX, y: e.clientY };
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!drag.current) return;
              const dx = e.clientX - drag.current.x;
              const dy = e.clientY - drag.current.y;
              drag.current = { x: e.clientX, y: e.clientY };
              setRot((r) => ({ x: Math.max(-35, Math.min(35, r.x - dy * 0.3)), y: isSculpture ? r.y + dx * 0.4 : Math.max(-60, Math.min(60, r.y + dx * 0.4)) }));
            }}
            onPointerUp={() => (drag.current = null)}
            onWheel={(e) => setZoom((z) => Math.max(0.6, Math.min(1.8, z - e.deltaY * 0.001)))}
          >
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
              style={{ background: "radial-gradient(ellipse at center top, color-mix(in oklch, var(--brand) 25%, transparent), transparent 70%)" }}
            />
            <div
              className="relative transition-transform duration-75"
              style={{
                transformStyle: "preserve-3d",
                transform: `scale(${zoom}) rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
              }}
            >
              {isSculpture ? (
                <div className="relative" style={{ transformStyle: "preserve-3d", width: 260, height: 360 }}>
                  {[0, 45, 90, 135].map((deg) => (
                    <img
                      key={deg}
                      src={artwork.image}
                      alt={deg === 0 ? artwork.title : ""}
                      draggable={false}
                      className="absolute inset-x-0 top-0 h-[300px] w-full rounded-2xl object-cover"
                      style={{ transform: `rotateY(${deg}deg)`, backfaceVisibility: "visible", opacity: deg === 0 ? 1 : 0.85 }}
                    />
                  ))}
                  {/* Sokkel */}
                  <div
                    className="absolute left-1/2 top-[300px] h-[60px] w-[180px] -translate-x-1/2 bg-mist"
                    style={{ transform: "translateX(-50%) rotateX(90deg) translateZ(-1px)", borderRadius: "50%" }}
                  />
                  <div className="absolute left-1/2 top-[300px] h-[60px] w-[180px] -translate-x-1/2 rounded-b-xl bg-mist/80" />
                </div>
              ) : (
              <div
                className="relative border-[14px] border-brand/80 bg-mist p-3 shadow-2xl"
                style={{ transformStyle: "preserve-3d", width: 300 }}
              >
                <img src={artwork.image} alt={artwork.title} className="block w-full" draggable={false} />
                {/* Ramme-dybde */}
                <div className="absolute inset-[-14px] bg-brand/60" style={{ transform: "translateZ(-24px)" }} />
              </div>
              )}
            </div>
          </div>
          <div className="absolute bottom-3 left-3 flex gap-2">
            {[
              { i: ZoomIn, f: () => setZoom((z) => Math.min(1.8, z + 0.15)), l: "Zoom inn" },
              { i: ZoomOut, f: () => setZoom((z) => Math.max(0.6, z - 0.15)), l: "Zoom ut" },
              { i: RotateCcw, f: () => { setRot({ x: -6, y: -20 }); setZoom(1); }, l: "Nullstill" },
            ].map(({ i: Icon, f, l }) => (
              <button key={l} onClick={f} aria-label={l} className="rounded-xl bg-mist/90 p-2 text-ink">
                <Icon className="size-4" />
              </button>
            ))}
          </div>
          <p className="absolute right-3 top-3 rounded-full bg-mist/90 px-3 py-1 text-xs text-ink">
            Dra for å snu · scroll for zoom
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
