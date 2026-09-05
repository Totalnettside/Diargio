import { createFileRoute, Link } from "@tanstack/react-router";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ExternalLink,
  Maximize,
  Minimize,
  RotateCw,
} from "lucide-react";
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
const FRAME_W = 380;
const CAM_OFFSET = 900;
const TURN = 45;

const works = artworks.slice(0, 12);

function GalleriPage() {
  const [pos, setPos] = useState(0);
  const [rot, setRot] = useState(0);
  const [isFs, setIsFs] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const max = works.length - 1;

  const forward = useCallback(() => setPos((p) => Math.min(max, p + 1)), [max]);
  const back = useCallback(() => setPos((p) => Math.max(0, p - 1)), []);
  const turnLeft = useCallback(() => setRot((r) => r + TURN), []);
  const turnRight = useCallback(() => setRot((r) => r - TURN), []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void sceneRef.current?.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFs = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        forward();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        back();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        turnLeft();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        turnRight();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [forward, back, turnLeft, turnRight]);

  const current = works[pos] ?? works[0]!;
  const currentArtist = artistById(current.artistId);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Virtuelt galleri</h1>
          <p className="mt-1 text-sm text-ink/60">
            Snu deg rundt med ← →, gå frem og tilbake med ↑ ↓ – som på et museum.
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink/60 glass">
          <RotateCw className="size-3.5" /> ← → snu · ↑ ↓ gå
        </span>
      </div>

      {/* 3D-scenen */}
      <div
        ref={sceneRef}
        className={`relative overflow-hidden ${
          isFs ? "h-full w-full" : "h-[72vh] min-h-[460px] rounded-3xl"
        }`}
        style={{
          perspective: "1500px",
          perspectiveOrigin: "50% 46%",
          background: "linear-gradient(180deg, oklch(0.24 0.03 292), oklch(0.14 0.02 292))",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${rot}deg) translateZ(${pos * SPACING + CAM_OFFSET}px)`,
            transition: "transform 0.9s cubic-bezier(0.25, 0.8, 0.25, 1)",
          }}
        >
          {/* Gulv, tak og vegger – segmentert slik at hvert plan holdes liten nok */}
          {Array.from({ length: works.length + 6 }, (_, k) => {
            const z = -((k - 2) + 0.5) * SPACING;
            return (
              <Fragment key={k}>
                {/* Gulv – mørk, polert parkett */}
                <div
                  className="absolute left-1/2 top-1/2"
                  style={{
                    width: WALL * 2 + 400,
                    height: SPACING,
                    transform: `translate(-50%, -50%) translate3d(0, 300px, ${z}px) rotateX(90deg)`,
                    background:
                      "linear-gradient(90deg, oklch(0.26 0.02 60) 0%, oklch(0.32 0.025 60) 50%, oklch(0.26 0.02 60) 100%)",
                    backgroundImage:
                      "repeating-linear-gradient(90deg, oklch(0.3 0.025 60) 0 90px, oklch(0.26 0.022 60) 90px 180px)",
                    boxShadow: "inset 0 0 160px oklch(0 0 0 / 0.55)",
                  }}
                />
                {/* Tak med lysrenne */}
                <div
                  className="absolute left-1/2 top-1/2"
                  style={{
                    width: WALL * 2 + 400,
                    height: SPACING,
                    transform: `translate(-50%, -50%) translate3d(0, -300px, ${z}px) rotateX(90deg)`,
                    background:
                      "linear-gradient(90deg, oklch(0.2 0.02 292) 0%, oklch(0.86 0.02 100) 44%, oklch(0.95 0.015 100) 50%, oklch(0.86 0.02 100) 56%, oklch(0.2 0.02 292) 100%)",
                  }}
                />
                {([-1, 1] as const).map((side) => (
                  <div
                    key={side}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      width: SPACING,
                      height: 600,
                      transform: `translate(-50%, -50%) translate3d(${side * WALL}px, 0, ${z}px) rotateY(${side === -1 ? 90 : -90}deg)`,
                      background:
                        "linear-gradient(180deg, oklch(0.62 0.02 292) 0%, oklch(0.88 0.012 292) 22%, oklch(0.82 0.012 292) 78%, oklch(0.42 0.02 292) 96%, oklch(0.3 0.02 292) 100%)",
                    }}
                  />
                ))}
              </Fragment>
            );
          })}
          {/* Inngangsvegg (bak deg ved start) */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: WALL * 2 + 400,
              height: 600,
              transform: `translate(-50%, -50%) translateZ(${SPACING * 2}px)`,
              background:
                "linear-gradient(180deg, oklch(0.68 0.02 292) 0%, oklch(0.88 0.012 292) 25%, oklch(0.8 0.014 292) 80%, oklch(0.32 0.02 292) 100%)",
            }}
          />
          {/* Bakvegg */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: WALL * 2 + 400,
              height: 600,
              transform: `translate(-50%, -50%) translateZ(${-(works.length + 1.5) * SPACING}px)`,
              background:
                "linear-gradient(180deg, oklch(0.68 0.02 292) 0%, oklch(0.88 0.012 292) 25%, oklch(0.8 0.014 292) 80%, oklch(0.32 0.02 292) 100%)",
            }}
          />
          {/* Verk på inngangs- og bakvegg (synlig når du snur deg) */}
          {[
            { w: works[4]!, z: SPACING * 2 - 40, face: 180 },
            { w: works[7]!, z: -(works.length + 1.5) * SPACING + 40, face: 0 },
          ].map(({ w, z, face }) => (
            <div
              key={`end-${w.id}-${face}`}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `translate(-50%, -50%) translate3d(0, -40px, ${z}px) rotateY(${face}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              <Frame w={w} />
            </div>
          ))}
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
                  transform: `translate(-50%, -50%) translate3d(${side * (WALL - 30)}px, -40px, ${z}px) rotateY(${side === -1 ? 74 : -74}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <Frame w={w} active={active} />
              </div>
            );
          })}
        </div>

        {/* Vignett og lysstemning */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 45%, transparent 45%, oklch(0.1 0.02 292 / 0.55) 100%)",
          }}
        />

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

        {/* Fullskjerm */}
        <button
          onClick={toggleFullscreen}
          aria-label={isFs ? "Avslutt fullskjerm" : "Fullskjerm"}
          className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-white/85 text-brandink backdrop-blur-md glass"
        >
          {isFs ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
        </button>

        {/* Snu venstre/høyre */}
        <button
          onClick={turnLeft}
          aria-label="Snu til venstre"
          className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-brandink backdrop-blur-md glass"
        >
          <ArrowLeft className="size-5" />
        </button>
        <button
          onClick={turnRight}
          aria-label="Snu til høyre"
          className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-brandink backdrop-blur-md glass"
        >
          <ArrowRight className="size-5" />
        </button>

        {/* Gå frem/tilbake */}
        <div className="absolute bottom-24 right-3 flex flex-col gap-2">
          <button
            onClick={forward}
            disabled={pos === max}
            aria-label="Gå fremover"
            className="grid size-11 place-items-center rounded-full bg-white/85 text-brandink backdrop-blur-md glass disabled:opacity-30"
          >
            <ArrowUp className="size-5" />
          </button>
          <button
            onClick={back}
            disabled={pos === 0}
            aria-label="Gå bakover"
            className="grid size-11 place-items-center rounded-full bg-white/85 text-brandink backdrop-blur-md glass disabled:opacity-30"
          >
            <ArrowDown className="size-5" />
          </button>
        </div>
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
