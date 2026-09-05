import { createFileRoute, notFound } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { ArtworkCard } from "@/components/ArtworkCard";
import { artworksBySeller, reviews, sellerBySlug } from "@/data/demo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/profil/$slug")({
  loader: ({ params }) => {
    const seller = sellerBySlug(params.slug);
    if (!seller) throw notFound();
    return { seller };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Profil ikke funnet | Geargio" }, { name: "robots", content: "noindex" }] };
    }
    const { seller } = loaderData;
    const title = `${seller.name} – ${seller.type.toLowerCase()} på Geargio`;
    const description = `${seller.name} i ${seller.location}. ${seller.rating} i vurdering, ${seller.sales} gjennomførte salg.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProfilePage,
});

function ProfilePage() {
  const { seller } = Route.useLoaderData();
  const { followedSellers, toggleFollowSeller } = useStore();
  const works = artworksBySeller(seller.id);
  const isGallery = seller.type === "Galleri" || seller.type === "Kunsthandler";

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-5">
      <section className="rounded-3xl p-5 glass md:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <img
            src={seller.avatar}
            alt={seller.name}
            width={512}
            height={512}
            className="size-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="font-display text-2xl font-semibold">{seller.name}</h1>
            <p className="text-sm text-ink/60">
              {seller.type} · {seller.location}
            </p>
            {seller.verified && (
              <p className="text-xs font-semibold text-brandink">
                ✓ Verifisert {isGallery ? "galleri" : "selger"}
              </p>
            )}
          </div>
          <button
            onClick={() => toggleFollowSeller(seller.id)}
            className="rounded-2xl bg-lav/70 px-5 py-2.5 text-sm font-semibold text-brandink glass"
          >
            {followedSellers.includes(seller.id) ? "Følger" : "Følg"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Vurdering", `${seller.rating.toFixed(1)} ★`],
            ["Salg", String(seller.sales)],
            ["Medlem siden", seller.memberSince],
            ["Responsrate", `${seller.responseRate}%`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-white/70 p-3 glass">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">{k}</p>
              <p className="text-lg font-bold">{v}</p>
            </div>
          ))}
        </div>

        {isGallery && (
          <div className="mt-4 rounded-2xl bg-white/70 p-4 text-sm glass">
            <p className="font-semibold">Om galleriet</p>
            <p className="mt-1 text-ink/70">{seller.about}</p>
            {seller.address && <p className="mt-2 text-ink/60">{seller.address}</p>}
            {seller.website && <p className="text-brandink">{seller.website}</p>}
            <p className="mt-2 text-xs text-ink/50">{seller.followers} følgere</p>
          </div>
        )}
      </section>

      <h2 className="mt-6 text-sm font-bold">Kunst til salgs</h2>
      {works.length === 0 ? (
        <p className="mt-3 rounded-3xl p-6 text-sm text-ink/60 glass">Ingen aktive annonser.</p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
          {works.map((a) => (
            <ArtworkCard key={a.id} artwork={a} />
          ))}
        </div>
      )}

      <h2 className="mt-8 text-sm font-bold">Vurderinger</h2>
      <div className="mt-3 space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-2xl p-4 glass">
            <div className="flex items-center gap-1">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-brand text-brand" />
              ))}
              <span className="ml-2 text-xs font-semibold">{r.author}</span>
              <span className="ml-auto text-xs text-ink/45">{r.date}</span>
            </div>
            <p className="mt-2 text-sm text-ink/70">{r.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
