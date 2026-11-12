import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { ArtworkCard } from "@/components/ArtworkCard";
import { AnimatedSearchInput } from "@/components/AnimatedSearchInput";
import { artists, artworksByArtist, categories, type Artwork } from "@/data/demo";
import { useStore } from "@/lib/store";
import { useRecent } from "@/lib/recent";
import { heroArtworks } from '@/data/hero-art';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/lib/seo';

export const Route = createFileRoute("/")({
  head: () => pageHead({
    title: "Diargio – et kunstunivers hvor alle har sin plass",
    description: "Kjøp og selg originalkunst, trykk, fotografi og samleobjekter direkte fra kunstnere, gallerier og private selgere i Norge.",
    path: "/",
  }),
  component: Index,
});

function Index() {


  const [q, setQ] = useState("");
  const [heroDemo, setHeroDemo] = useState<Artwork | null>(null);
  const navigate = useNavigate();
  const { allArtworks, toggleFollowArtist, followedArtists } = useStore();
  const artworks = allArtworks;
  const searchTitles = useMemo(() => artworks.map((artwork) => artwork.title), [artworks]);
  // I starten fremheves all kunst som legges ut, så alt kommer på forsiden.
  const featuredArtworks = artworks;
  const nyeste = [...artworks].sort((a, b) => a.createdDaysAgo - b.createdDaysAgo).slice(0, 9);
  const utvalgte = artworks.slice(9, 15);
  const recentIds = useRecent();
  const recent = recentIds.map((id) => artworks.find((a) => a.id === id)).filter((a): a is (typeof artworks)[number] => Boolean(a));


  const heroRef = useRef<HTMLElement>(null);
  const heroFrames = heroArtworks;

  const onHeroMove = (e: React.MouseEvent) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", String(((e.clientX - r.left) / r.width) * 2 - 1));
    el.style.setProperty("--my", String(((e.clientY - r.top) / r.height) * 2 - 1));
  };

  return (
    <div className="quiet-luxury bg-ivory">
      <main className="home-main mx-auto w-full">
      <section
        ref={heroRef}
        onMouseMove={onHeroMove}
        className="home-hero relative overflow-hidden"
      >
        <div className="home-hero-grid">
          <div className="home-hero-copy relative z-10 min-w-0">
            <div className="hero-rise flex items-center gap-3" style={{ animationDelay: "0ms" }}>
              <span className="h-px w-8 bg-nav-highlight" />
              <p className="home-eyebrow text-primary-foreground">
                Markedsplass for kunst og skaperglede
              </p>
            </div>
            <h1
              className="hero-rise home-heading font-display font-semibold text-primary-foreground"
              style={{ animationDelay: "90ms" }}
            >
              <span className="home-heading-line">Velkommen til et</span>{" "}<span className="home-heading-line">kunstunivers hvor</span>{" "}<span className="home-heading-line"><em className="italic text-nav-highlight">alle</em> har sin plass.</span>
            </h1>
            <p
              className="hero-rise home-description text-primary-foreground/85"
              style={{ animationDelay: "180ms" }}
            >
              Kjøp og selg originalkunst, trykk, fotografi og samleobjekter direkte fra kunstnere,
              gallerier og private selgere.
            </p>
            <form
              className="hero-rise home-search flex min-w-0 items-center gap-3 bg-card text-ink"
              style={{ animationDelay: "270ms" }}
              onSubmit={(e) => {
                e.preventDefault();
                void navigate({ to: "/sok", search: { q } });
              }}
            >
              <Search className="size-5 shrink-0 opacity-60" />
              <AnimatedSearchInput value={q} onChange={(e) => setQ(e.target.value)} titles={searchTitles} />
            </form>
            <div className="hero-rise home-actions flex items-center gap-4" style={{ animationDelay: "360ms" }}>
              <Button asChild variant="ghost" className="home-explore"><Link to="/kunst">Utforsk kunst</Link></Button>
            </div>
          </div>

          <div className="hero-rise home-art-composition relative min-w-0" style={{ animationDelay: "250ms" }}>
            {heroFrames.map((a, i) => {
              const spots = ["home-art-front", "home-art-back", "home-art-right"];
              return (
                <div
                  key={a.id}
                  className={`home-art-position absolute ${spots[i]}`}
                  style={{
                    transform: `translate3d(calc(var(--mx, 0) * ${[10, -18, 22][i]}px), calc(var(--my, 0) * ${[8, -14, 16][i]}px), 0)`,
                    transition: "transform 0.25s ease-out",
                  }}
                >
                  <div
                    className="hero-float"
                    style={{ animationDelay: `${i * 1.2}s`, ["--r" as string]: `${[-1.5, -6, 3][i]}deg` }}
                  >
                    <Button
                      variant="ghost"
                      aria-label={`Se illustrasjon ${a.title}`}
                      onClick={() => setHeroDemo(a)}
                      className="hero-frame home-art-card relative block h-auto w-full rounded-none p-0 text-left hover:bg-transparent"
                    >
                      <img src={a.image} alt={a.title} loading="eager" fetchPriority={i === 0 ? "high" : "auto"} className="block h-auto w-full object-contain" />
                    </Button>
                  </div>
                </div>
              );
            })}
            <div className="home-new-badge absolute z-30 flex items-center gap-2 rounded-full bg-card/90 px-4 py-2 text-brandink">
              <span className="size-2 rounded-full bg-brand" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-brandink">
                Nye verk hver uke
              </span>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={Boolean(heroDemo)} onOpenChange={(open) => { if (!open) setHeroDemo(null); }}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader><DialogTitle>{heroDemo?.title}</DialogTitle></DialogHeader>
          {heroDemo && <img src={heroDemo.image} alt={heroDemo.title} className="h-auto w-full object-contain" />}
        </DialogContent>
      </Dialog>

      <p className="mb-3 mt-6 text-sm font-bold">Utforsk kunst</p>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar md:flex-nowrap">
        {categories.map((c) => (
          <Link
            key={c}
            to="/kunst"
            search={{ kategori: c }}
            className="shrink-0 whitespace-nowrap rounded-full border border-border/60 bg-card px-4 py-2 text-xs font-semibold tracking-wide text-brandink transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.04] hover:border-gronn hover:bg-gronn hover:text-primary-foreground hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gronn focus-visible:ring-offset-2 active:scale-100 md:min-w-0 md:flex-1 md:px-2 md:text-center"
          >


            {c}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-bold">Fremhevede annonser</h2>
        <span className="rounded-full bg-brandink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">Fremhevet</span>
      </div>
      <div className="home-inventory-grid mt-3">
        {featuredArtworks.length === 0 ? (
          <p className="text-xs text-ink/50">Ingen annonser lagt ut ennå – bli den første!</p>
        ) : (
          featuredArtworks.map((a) => (
            <ArtworkCard key={a.id} artwork={a} />
          ))
        )}
      </div>

      {recent.length > 0 && (
        <>
          <h2 className="mt-6 text-sm font-bold">Nylig sett</h2>
          <div className="home-inventory-grid mt-3">
            {recent.map((a) => (
              <ArtworkCard key={a.id} artwork={a} />
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
      <div className="home-inventory-grid mt-3">
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
                className={`mt-2 w-full rounded-xl py-1.5 text-[11px] font-semibold text-brandink glass ${
                  following ? "bg-mint/70" : "bg-lav/70"
                }`}


              >
                {following ? "Følger" : "Følg"}
              </button>
            </div>
          );
        })}
      </div>

      <h2 className="mt-6 text-sm font-bold">Utvalgte verk</h2>
      <div className="home-inventory-grid mt-3">
        {utvalgte.map((a) => (
          <ArtworkCard key={a.id} artwork={a} />
        ))}
      </div>

      <section className="mb-10 mt-6 rounded-3xl p-5 sell-surface md:p-8">
        <h2 className="font-display text-lg font-semibold md:text-2xl">Har du kunst du vil selge?</h2>
        <p className="mt-1 text-xs text-ink/60 md:text-sm">
          Legg ut på under to minutter. Gratis for private selgere.
        </p>
        <Link
          to="/selg"
          className="mt-3 block w-full rounded-2xl bg-ink py-3 text-center text-sm font-semibold text-primary-foreground md:w-auto md:px-8"


        >
          Legg ut kunst
        </Link>
      </section>

      </main>
    </div>
  );
}
