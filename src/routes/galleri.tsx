import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, MoveHorizontal } from "lucide-react";
import { artistById, artworks, formatPrice } from "@/data/demo";

export const Route = createFileRoute("/galleri")({
  head: () => ({
    meta: [
      { title: "Virtuelt galleri – Geargio" },
      {
        name: "description",
        content: "Vandr gjennom Geargios virtuelle galleri og opplev kunsten som på et museum.",
      },
      { property: "og:title", content: "Virtuelt galleri – Geargio" },
      {
        property: "og:description",
        content: "Vandr gjennom Geargios virtuelle galleri og opplev kunsten som på et museum.",
      },
    ],
  }),
  component: GalleriPage,
});

const SPACING = 1400;
const WALL = 560;
const FRAME_W = 340;

const works = artworks.slice(0, 12);
const LENGTH = (works.length + 2) * SPACING;

function GalleriPage() {
  const [pos, setPos] = useState(0);
  const max = works.length - 1;

  const forward = useCallback(() => setPos((p) => Math.min(max, p + 1)), [max]);
  const back = useCallback(() => setPos((p) => Math.max(0, p - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        forward();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [forward, back]);

  const current = works[pos];
  const currentArtist = artistById(current.artistId);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Virtuelt galleri</h1>
          <p className="mt-1 text-sm text-ink/60">
            Vandre gjennom utstillingen – bruk piltastene som om du gikk på museum.
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink/60 glass">
          <MoveHorizontal className="size-3.5" /> ← → piltastene
        </span>
      </div>

      {/* 3D-scenen */}
      <div
        className="relative h-[62vh] min-h-[420px] overflow-hidden rounded-3xl glass-lift"
        style={{ perspective: "850px" }}
      >
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: `translateZ(${pos * SPACING + 500}px)`,
            transition: "transform 1.1s cubic-bezier(0.25, 0.8, 0.25, 1)",
          }}
        >
          {/* Gulv */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: WALL * 2 + 400,
              height: LENGTH + 3000,
              transform: `translate(-50%, -50%) translate3d(0, 300px, ${-LENGTH / 2}px) rotateX(90deg)`,
              background:
                "linear-gradient(180deg, oklch(0.93 0.02 290), oklch(0.86 0.025 290))",
              boxShadow: "inset 0 0 120px oklch(0.7 0.05 290 / 0.5)",
            }}
          />
          {/* Tak */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: WALL * 2 + 400,
              height: LENGTH + 3000,
              transform: `translate(-50%, -50%) translate3d(0, -300px, ${-LENGTH / 2}px) rotateX(90deg)`,
              background: "oklch(0.97 0.01 290)",
            }}
          />
          {/* Vegger */}
          {([-1, 1] as const).map((side) => (
            <div
              key={side}
              className="absolute left-1/2 top-1/2"
              style={{
                width: LENGTH + 3000,
                height: 600,
                transform: `translate(-50%, -50%) translate3d(${side * WALL}px, 0, ${-LENGTH / 2}px) rotateY(${side === -1 ? 90 : -90}deg)`,
                background:
                  "linear-gradient(180deg, oklch(0.98 0.008 290) 0%, oklch(0.95 0.015 290) 70%, oklch(0.9 0.02 290) 100%)",
              }}
            />
          ))}
          {/* Bakvegg */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: WALL * 2 + 400,
              height: 600,
              transform: `translate(-50%, -50%) translateZ(${-LENGTH - 400}px)`,
              background: "oklch(0.95 0.015 290)",
            }}
          />
          {/* Kunstverk på veggene */}
          {works.map((w, i) => {
            const side = i % 2 === 0 ? -1 : 1;
            const z = -(i + 1) * SPACING;
            const active = i === pos;
            return (
              <div
                key={w.id}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `translate(-50%, -50%) translate3d(${side * (WALL - 6)}px, -40px, ${z}px) rotateY(${side === -1 ? 90 : -90}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className="rounded-sm p-3 transition-all duration-700"
                  style={{
                    width: FRAME_W,
                    background: "oklch(1 0 0)",
                    boxShadow: active
                      ? "0 30px 60px -20px oklch(0.4 0.1 290 / 0.55)"
                      : "0 16px 30px -18px oklch(0.4 0.05 290 / 0.4)",
                    outline: active ? "3px solid var(--brand)" : "3px solid oklch(0.3 0.02 290)",
                    outlineOffset: "3px",
                  }}
                >
                  <img
                    src={w.image}
                    alt={`${w.title} av ${artistById(w.artistId)?.name ?? ""}`}
                    className="aspect-square w-full object-cover"
                    draggable={false}
                  />
                  {/* Skilt på veggen */}
                  <div className="mt-2 px-1 pb-1">
                    <p className="font-display text-sm font-semibold leading-tight">{w.title}</p>
                    <p className="text-[11px] text-ink/55">
                      {artistById(w.artistId)?.name} · {formatPrice(w.price)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Blendingsgradienter for dybde */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/40 to-transparent" />

        {/* Info om verket foran deg */}
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl bg-white/85 p-4 backdrop-blur-md glass">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brandink">
              Verk {pos + 1} av {works.length}
            </p>
            <p className="truncate font-display text-lg font-semibold">{current.title}</p>
            <p className="truncate text-xs text-ink/60">
              {currentArtist?.name} · {formatPrice(current.price)}
            </p>
          </div>
          <Link
            to="/kunst/$slug"
            params={{ slug: current.slug }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-brandink px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            Se annonsen <ExternalLink className="size-3.5" />
          </Link>
        </div>

        {/* Navigasjonspiler for berøring/mus */}
        <button
          onClick={back}
          disabled={pos === 0}
          aria-label="Gå bakover"
          className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-brandink backdrop-blur-md glass disabled:opacity-30"
        >
          <ArrowLeft className="size-5" />
        </button>
        <button
          onClick={forward}
          disabled={pos === max}
          aria-label="Gå fremover"
          className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-brandink backdrop-blur-md glass disabled:opacity-30"
        >
          <ArrowRight className="size-5" />
        </button>
      </div>

      {/* Fremdrift */}
      <div className="mt-4 flex justify-center gap-1.5">
        {works.map((w, i) => (
          <button
            key={w.id}
            onClick={() => setPos(i)}
            aria-label={`Gå til ${w.title}`}
            className={`h-1.5 rounded-full transition-all ${
              i === pos ? "w-6 bg-brandink" : "w-1.5 bg-ink/20"
            }`}
          />
        ))}
      </div>
    </main>
  );
}
