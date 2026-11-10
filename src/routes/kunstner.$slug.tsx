import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArtworkCard } from "@/components/ArtworkCard";
import { artistBySlug, artworksByArtist } from "@/data/demo";
import { useStore } from "@/lib/store";
import { NOT_FOUND_DESCRIPTION, NOT_FOUND_TITLE, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/kunstner/$slug")({
  loader: ({ params }) => {
    const artist = artistBySlug(params.slug);
    if (!artist) throw notFound();
    return { artist };
  },
  head: ({ loaderData, params }) => {
    const path = `/kunstner/${params.slug}`;
    if (!loaderData) return pageHead({ title: NOT_FOUND_TITLE, description: NOT_FOUND_DESCRIPTION, path, noindex: true });
    const { artist } = loaderData;
    const title = `${artist.name} – verk til salgs | Diargio`;
    const description = `${artist.name}, ${artist.nationality.toLowerCase()} kunstner (${artist.born}). Se verk til salgs på Diargio.`;
    return pageHead({
      title,
      description,
      path,
      image: artist.avatar,
      ogType: "profile",
      breadcrumbs: [{ name: "Forsiden", path: "/" }, { name: artist.name, path }],
    });
  },
  component: ArtistPage,
});

function ArtistPage() {
  const { artist } = Route.useLoaderData();
  const { followedArtists, toggleFollowArtist } = useStore();
  const works = artworksByArtist(artist.id);
  const following = followedArtists.includes(artist.id);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-5">
      <section className="rounded-3xl p-5 hero-surface md:p-8">
        <div className="flex items-center gap-4">
          <img
            src={artist.avatar}
            alt={artist.name}
            width={512}
            height={512}
            className="size-20 rounded-full object-cover"
          />
          <div>
            <h1 className="font-display text-2xl font-semibold">{artist.name}</h1>
            <p className="text-sm text-ink/60">
              {artist.nationality} · {artist.born} · {artist.movement}
            </p>
            <button
              onClick={() => toggleFollowArtist(artist.id)}
              className={`mt-2 rounded-2xl px-5 py-2 text-sm font-semibold text-brandink glass ${
                following ? "bg-mint/70" : "bg-white/70"
              }`}
            >
              {following ? "Følger" : "Følg kunstner"}
            </button>
          </div>
        </div>
        <p className="mt-4 max-w-[70ch] text-sm leading-relaxed text-ink/70">{artist.bio}</p>
      </section>

      <h2 className="mt-6 text-sm font-bold">Verk av {artist.name} til salgs</h2>
      {works.length === 0 ? (
        <p className="mt-3 rounded-3xl p-6 text-sm text-ink/60 glass">
          Ingen aktive annonser akkurat nå. Følg kunstneren for å få varsel ved nye verk.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-2 items-start gap-3 md:grid-cols-3">
          {works.map((a) => (
            <ArtworkCard key={a.id} artwork={a} />
          ))}
        </div>
      )}
    </main>
  );
}
