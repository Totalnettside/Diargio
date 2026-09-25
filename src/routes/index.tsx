import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { ArtworkCard } from "@/components/ArtworkCard";
import { artists, artworks, artworksByArtist, categories } from "@/data/demo";
import { useStore } from "@/lib/store";

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

function Index() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { toggleFollowArtist, followedArtists } = useStore();
  const nyeste = [...artworks].sort((a, b) => a.createdDaysAgo - b.createdDaysAgo).slice(0, 9);
  const utvalgte = artworks.filter((a) => a.verified).slice(9, 15);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pt-4">
      <section className="mt-2 rounded-3xl p-5 hero-surface md:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brandink">
          Norsk markedsplass for kunst
        </p>
        <h1 className="mt-2 max-w-[16ch] font-display text-[32px] font-semibold leading-[1.05] tracking-tight md:text-5xl">
          Finn kunst du faktisk vil ha på veggen.
        </h1>
        <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink/60 md:text-base">
          Kjøp og selg originalkunst, trykk, fotografi og samleobjekter direkte fra kunstnere,
          gallerier og private selgere.
        </p>
        <form
          className="mt-4 flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-3 glass md:max-w-xl"
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
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/45"
          />
        </form>
        <div className="mt-3 flex gap-2">
          <Link
            to="/kunst"
            className="flex-1 rounded-2xl bg-brandink py-3 text-center text-sm font-semibold text-primary-foreground md:flex-none md:px-8"
            style={{ boxShadow: "0 12px 24px -14px oklch(0.48 0.219 285)" }}
          >
            Utforsk kunst
          </Link>
          <Link
            to="/selg"
            className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-semibold text-brandink glass md:px-8"
          >
            Selg kunst
          </Link>
        </div>
      </section>

      <p className="mb-3 mt-6 text-sm font-bold">Utforsk kunst</p>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((c) => (
          <Link
            key={c}
            to="/kunst"
            search={{ kategori: c }}
            className="shrink-0 rounded-full bg-white/60 px-4 py-2 text-xs font-semibold glass"
          >
            {c}
          </Link>
        ))}
      </div>

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
          className="mt-3 block w-full rounded-2xl bg-ink py-3 text-center text-sm font-semibold text-primary-foreground md:w-auto md:px-8"
        >
          Legg ut kunst
        </Link>
      </section>
    </main>
  );
}
