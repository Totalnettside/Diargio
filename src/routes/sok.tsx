import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { ArtworkCard } from "@/components/ArtworkCard";
import { artists, artworks, sellers } from "@/data/demo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/sok")({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search["q"] === "string" ? { q: search["q"] } : {},
  head: () => ({
    meta: [
      { title: "Søk i kunst, kunstnere og gallerier | Diargio" },
      {
        name: "description",
        content: "Søk blant tusenvis av kunstverk, kunstnere og gallerier på Diargio.",
      },
      { property: "og:title", content: "Søk på Diargio" },
      { property: "og:description", content: "Finn kunstnere, verk, kategorier og gallerier." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const { saveSearch } = useStore();
  const [term, setTerm] = useState(q ?? "");
  const lower = term.trim().toLowerCase();

  const matchedArtists = lower ? artists.filter((a) => a.name.toLowerCase().includes(lower)) : [];
  const matchedSellers = lower ? sellers.filter((s) => s.name.toLowerCase().includes(lower)) : [];
  const matchedWorks = lower
    ? artworks.filter((a) =>
        `${a.title} ${a.category} ${a.style} ${a.technique}`.toLowerCase().includes(lower),
      )
    : [];

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-5">
      <h1 className="font-display text-2xl font-semibold">Hva leter du etter?</h1>
      <form
        className="mt-3 flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-3 glass"
        onSubmit={(e) => {
          e.preventDefault();
          void navigate({ to: "/sok", search: { q: term } });
        }}
      >
        <Search className="size-4 opacity-60" />
        <input
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Kunstner, verk, kategori eller galleri"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink/45"
        />
      </form>

      {lower && (
        <>
          <button
            onClick={() => saveSearch(term, term)}
            className="mt-3 rounded-2xl bg-lav/70 px-4 py-2 text-sm font-semibold text-brandink glass"
          >
            Lagre søk
          </button>

          {matchedArtists.length > 0 && (
            <section className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wide text-ink/45">Kunstner</p>
              <div className="mt-2 space-y-2">
                {matchedArtists.map((a) => (
                  <Link
                    key={a.id}
                    to="/kunstner/$slug"
                    params={{ slug: a.slug }}
                    className="flex items-center gap-3 rounded-2xl p-3 glass"
                  >
                    <img
                      src={a.avatar}
                      alt={a.name}
                      loading="lazy"
                      width={512}
                      height={512}
                      className="size-10 rounded-full object-cover"
                    />
                    <span className="text-sm font-semibold">{a.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {matchedSellers.length > 0 && (
            <section className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wide text-ink/45">
                Selgere og gallerier
              </p>
              <div className="mt-2 space-y-2">
                {matchedSellers.map((s) => (
                  <Link
                    key={s.id}
                    to="/profil/$slug"
                    params={{ slug: s.slug }}
                    className="flex items-center gap-3 rounded-2xl p-3 glass"
                  >
                    <img
                      src={s.avatar}
                      alt={s.name}
                      loading="lazy"
                      width={512}
                      height={512}
                      className="size-10 rounded-full object-cover"
                    />
                    <span className="text-sm font-semibold">{s.name}</span>
                    <span className="ml-auto text-xs text-ink/50">{s.type}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wide text-ink/45">
              Kunst til salgs · {matchedWorks.length} annonser
            </p>
            <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3">
              {matchedWorks.slice(0, 12).map((a) => (
                <ArtworkCard key={a.id} artwork={a} />
              ))}
            </div>
          </section>

          <section className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wide text-ink/45">Relaterte søk</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[`${term} litografi`, `${term} grafikk`, `${term} original`].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setTerm(r);
                    void navigate({ to: "/sok", search: { q: r } });
                  }}
                  className="rounded-full bg-white/60 px-4 py-2 text-xs font-semibold glass"
                >
                  {r}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
