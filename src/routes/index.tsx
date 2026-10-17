import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { ArtworkCard } from "@/components/ArtworkCard";
import { artists, artworksByArtist, categories, formatPrice } from "@/data/demo";
import { useStore } from "@/lib/store";
import { useRecent } from "@/lib/recent";
import { investorArtworks } from '@/data/investor-art';
import { InvestorArtCard } from '@/components/InvestorArt';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Diargio – finn kunst du faktisk vil ha på veggen" },
      {
        name: "description",
        content:
          "Kjøp og selg originalkunst, trykk, fotografi og samleobjekter direkte fra kunstnere, gallerier og private selgere i Norge.",
      },
      { property: "og:title", content: "Diargio – markedsplassen for kunst i Norge" },
      {
        property: "og:description",
        content: "Kjøp og selg kunst direkte fra kunstnere, gallerier og private selgere.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const chipTints = ["bg-lilac/50", "bg-sea/45", "bg-butter/60", "bg-coral/45", "bg-mint/55", "bg-blush/50"];

function Index() {

  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { allArtworks, toggleFollowArtist, followedArtists } = useStore();
  const artworks = allArtworks;
  // I starten fremheves all kunst som legges ut, så alt kommer på forsiden.
  const featuredArtworks = artworks;
  const nyeste = [...artworks].sort((a, b) => a.createdDaysAgo - b.createdDaysAgo).slice(0, 9);
  const utvalgte = artworks.slice(9, 15);
  const recentIds = useRecent();
  const recent = recentIds.map((id) => artworks.find((a) => a.id === id)).filter((a): a is (typeof artworks)[number] => Boolean(a));


  const heroRef = useRef<HTMLElement>(null);
  // Heroen skal alltid vise tre fremhevede bilder – fyll opp med demoverk om det trengs.
  const heroFrames = [...featuredArtworks, ...investorArtworks].slice(0, 3);

  const onHeroMove = (e: React.MouseEvent) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", String(((e.clientX - r.left) / r.width) * 2 - 1));
    el.style.setProperty("--my", String(((e.clientY - r.top) / r.height) * 2 - 1));
  };

  return (
    <div className="bg-topbar">
      <main className="mx-auto w-full max-w-6xl px-5 pt-4">
      <section
        ref={heroRef}
        onMouseMove={onHeroMove}
        className="home-hero relative mt-2 overflow-hidden rounded-3xl"
      >
        <div className="grid items-center gap-8 p-5 md:p-10 lg:min-h-[480px] lg:grid-cols-[1.05fr_1fr] lg:gap-4">
          <div className="relative z-10">
            <div className="hero-rise flex items-center gap-3" style={{ animationDelay: "0ms" }}>
              <span className="h-px w-8 bg-brand" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brandink">
                Norsk markedsplass for kunst
              </p>
            </div>
            <h1
              className="hero-rise mt-3 max-w-[16ch] font-display text-[32px] font-semibold leading-[1.05] tracking-tight md:text-5xl"
              style={{ animationDelay: "90ms" }}
            >
              Finn kunst du <em className="italic text-brand">faktisk</em> vil ha på veggen.
            </h1>
            <p
              className="hero-rise mt-2 max-w-[60ch] text-sm leading-relaxed text-ink/85 md:text-base"
              style={{ animationDelay: "180ms" }}
            >
              Kjøp og selg originalkunst, trykk, fotografi og samleobjekter direkte fra kunstnere,
              gallerier og private selgere.
            </p>
            <form
              className="hero-rise mt-4 flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-3 glass md:max-w-xl"
              style={{ animationDelay: "270ms" }}
              onSubmit={(e) => {
                e.preventDefault();
                void navigate({ to: "/sok", search: { q } });
              }}
            >
              <Search className="size-4 opacity-60" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Søk etter kunstner, verk, stil eller kategori"
                className="w-full bg-transparent text-sm outline-none placeholder:text-ink/80"
              />
            </form>
            <div className="hero-rise mt-3 flex gap-2" style={{ animationDelay: "360ms" }}>
              <Link
                to="/kunst"
                className="hero-cta flex-1 rounded-2xl py-3 text-center text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 md:flex-none md:px-8"

              >
                Utforsk kunst
              </Link>
              <Link
                to="/selg"
                className="hero-cta-ghost rounded-2xl px-4 py-3 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5"

              >
                Selg kunst
              </Link>
            </div>
          </div>

          <div className="hero-rise relative h-[300px] sm:h-[360px] lg:h-[440px]" style={{ animationDelay: "250ms" }}>
            <div className="hero-ring absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand/25 lg:size-80" />
            {heroFrames.map((a, i) => {
              const spots = [
                "left-1/2 top-1/2 z-20 w-44 -translate-x-[62%] -translate-y-[58%] sm:w-52 lg:w-56",
                "left-1/2 top-1/2 z-10 w-28 -translate-x-[150%] -translate-y-[95%] -rotate-6 sm:w-32 lg:w-36",
                "left-1/2 top-1/2 z-10 w-32 translate-x-[15%] translate-y-[15%] rotate-3 sm:w-36 lg:w-40",
              ];
              return (
                <div
                  key={a.id}
                  className={`absolute ${spots[i]}`}
                  style={{
                    transform: `translate3d(calc(var(--mx, 0) * ${[10, -18, 22][i]}px), calc(var(--my, 0) * ${[8, -14, 16][i]}px), 0)`,
                    transition: "transform 0.25s ease-out",
                  }}
                >
                  <div
                    className="hero-float"
                    style={{ animationDelay: `${i * 1.2}s`, ["--r" as string]: `${[-1.5, -6, 3][i]}deg` }}
                  >
                    {a.id.startsWith("investor-demo") ? (
                      <Link
                        to="/utstillinger"
                        search={{ investor: true }}
                        className="hero-frame block bg-white p-2 shadow-[0_25px_50px_-15px_oklch(0.25_0.018_155/0.4)] ring-1 ring-ink/10 sm:p-3"
                      >
                        <img
                          src={a.image}
                          alt={a.title}
                          loading={i === 0 ? "eager" : "lazy"}
                          className="aspect-[3/4] w-full object-cover"
                        />
                        <div className="flex items-baseline justify-between gap-2 px-1 pt-2">
                          <p className="truncate text-[10px] font-semibold sm:text-[11px]">{a.title}</p>
                          <p className="shrink-0 text-[10px] font-bold text-brand">{formatPrice(a.price)}</p>
                        </div>
                      </Link>
                    ) : (
                      <Link
                        to="/kunst/$slug"
                        params={{ slug: a.slug }}
                        className="hero-frame block bg-white p-2 shadow-[0_25px_50px_-15px_oklch(0.25_0.018_155/0.4)] ring-1 ring-ink/10 sm:p-3"
                      >
                        <img
                          src={a.image}
                          alt={a.title}
                          loading={i === 0 ? "eager" : "lazy"}
                          className="aspect-[3/4] w-full object-cover"
                        />
                        <div className="flex items-baseline justify-between gap-2 px-1 pt-2">
                          <p className="truncate text-[10px] font-semibold sm:text-[11px]">{a.title}</p>
                          <p className="shrink-0 text-[10px] font-bold text-brand">{formatPrice(a.price)}</p>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="absolute bottom-0 right-0 z-30 flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 shadow-lg backdrop-blur glass">
              <span className="size-2 rounded-full bg-brand" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-brandink">
                Nye verk hver uke
              </span>
            </div>
          </div>
        </div>
      </section>

      <p className="mb-3 mt-6 text-sm font-bold">Utforsk kunst</p>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar md:flex-nowrap">
        {categories.map((c, i) => (
          <Link
            key={c}
            to="/kunst"
            search={{ kategori: c }}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-brandink ring-1 ring-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.04] hover:shadow-md active:scale-100 md:min-w-0 md:flex-1 md:px-2 md:text-center ${
              chipTints[i % chipTints.length]
            }`}
          >

            {c}
          </Link>
        ))}
      </div>

      <section className="mt-8 border-y border-border py-6" aria-label="Investorvisning">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-display text-lg font-medium">Investorvisning — ti demoverk</h2><p className="mt-1 text-xs text-muted-foreground">AI-genererte illustrasjoner · Eksempelpriser · Ikke til salgs</p></div>
          <Button asChild variant="outline"><Link to="/utstillinger" search={{ investor: true }}>Se demoutstillingen</Link></Button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">{investorArtworks.map((artwork) => <InvestorArtCard key={artwork.id} artwork={artwork} />)}</div>
      </section>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-bold">Fremhevede annonser</h2>
        <span className="hero-cta rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">Fremhevet</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
        {featuredArtworks.length === 0 ? (
          <p className="text-xs text-ink/50">Ingen annonser lagt ut ennå – bli den første!</p>
        ) : (
          featuredArtworks.map((a) => (
            <div key={a.id} className="rounded-2xl ring-2 ring-brandink/30">
              <ArtworkCard artwork={a} />
            </div>
          ))
        )}
      </div>

      {recent.length > 0 && (
        <>
          <h2 className="mt-6 text-sm font-bold">Nylig sett</h2>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {recent.map((a) => (
              <div key={a.id} className="w-44 shrink-0">
                <ArtworkCard artwork={a} />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-bold">Nytt på markedsplassen</h2>
        <Link to="/kunst" className="text-xs font-semibold text-brandink">
          Se alle
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
        {nyeste.map((a) => (
          <ArtworkCard key={a.id} artwork={a} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-bold">Populære kunstnere</h2>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {artists.map((artist) => {
          const following = followedArtists.includes(artist.id);
          return (
            <div key={artist.id} className="w-32 shrink-0 rounded-2xl p-3 text-center glass">
              <Link to="/kunstner/$slug" params={{ slug: artist.slug }}>
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="mx-auto size-16 rounded-full object-cover"
                />
                <p className="mt-2 truncate text-xs font-semibold">{artist.name}</p>
              </Link>
              <p className="text-[11px] text-ink/45">{artworksByArtist(artist.id).length} verk</p>
              <button
                onClick={() => toggleFollowArtist(artist.id)}
                className={`mt-2 w-full rounded-xl py-1.5 text-[11px] font-semibold text-brandink ring-1 ring-white/70 ${
                  following ? "bg-sea/50" : "bg-blush/50"
                }`}

              >
                {following ? "Følger" : "Følg"}
              </button>
            </div>
          );
        })}
      </div>

      <h2 className="mt-6 text-sm font-bold">Utvalgte verk</h2>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {utvalgte.map((a) => (
          <div key={a.id} className="w-56 shrink-0">
            <ArtworkCard artwork={a} />
          </div>
        ))}
      </div>

      <section className="mb-10 mt-6 rounded-3xl p-5 sell-surface md:p-8">
        <h2 className="font-display text-lg font-semibold md:text-2xl">Har du kunst du vil selge?</h2>
        <p className="mt-1 text-xs text-ink/60 md:text-sm">
          Legg ut på under to minutter. Gratis for private selgere.
        </p>
        <Link
          to="/selg"
          className="hero-cta mt-3 block w-full rounded-2xl py-3 text-center text-sm font-semibold md:w-auto md:px-8"

        >
          Legg ut kunst
        </Link>
      </section>

      </main>
    </div>
  );
}
