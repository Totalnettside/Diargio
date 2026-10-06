import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { artistById, formatPrice, type Artwork } from "@/data/demo";
import { useStore } from "@/lib/store";

export function ArtworkCard({ artwork, large = false }: { artwork: Artwork; large?: boolean }) {
  const { isFavorite, toggleFavorite } = useStore();
  const artist = artistById(artwork.artistId);
  const fav = isFavorite(artwork.id);

  return (
    <article className="group overflow-hidden border-b border-border bg-card">
      <div className="relative overflow-hidden bg-muted">
        <Link to="/kunst/$slug" params={{ slug: artwork.slug }}>
          <img
            src={artwork.image}
            alt={`${artwork.title} av ${artist?.name ?? "ukjent kunstner"}`}
            loading="lazy"
            width={1024}
            height={1024}
            className={`${large ? "aspect-[4/3]" : "aspect-[4/5]"} w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]`}
          />
        </Link>
        <button
          onClick={() => toggleFavorite(artwork.id)}
          aria-label={fav ? "Fjern favoritt" : "Lagre som favoritt"}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-card/90 shadow-sm backdrop-blur"
        >
          <Heart className={`size-4 ${fav ? "fill-brand text-brand" : "text-ink"}`} />
        </button>
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1">
          {artwork.verified && (
            <span className="rounded-sm bg-card/90 px-2.5 py-1 text-[10px] font-semibold text-brandink backdrop-blur">
              ✓ Verifisert
            </span>
          )}
        </div>
      </div>
      <div className={large ? "px-1 py-4" : "px-1 py-3"}>
        <Link
          to="/kunstner/$slug"
          params={{ slug: artist?.slug ?? "" }}
          className={`font-semibold text-brandink hover:text-foreground ${large ? "text-sm" : "text-xs"}`}
        >
          {artist?.name}
        </Link>
        <Link to="/kunst/$slug" params={{ slug: artwork.slug }} className="block">
          <p className={`truncate font-display font-medium ${large ? "text-xl" : "text-[13px]"}`}>{artwork.title}</p>
        </Link>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <span className={`font-bold ${large ? "text-base" : "text-sm"}`}>
            {artwork.saleType === "Pris på forespørsel"
              ? "Pris på forespørsel"
              : formatPrice(artwork.saleType === "Auksjon" ? (artwork.currentBid ?? artwork.price) : artwork.price)}
          </span>
          <span className="text-[11px] text-ink/45">{artwork.location}</span>
        </div>
        {artwork.saleType === "Auksjon" && (
          <p className="mt-1 text-[11px] font-semibold text-brandink">
            Auksjon · {artwork.bidCount} bud
          </p>
        )}
      </div>
    </article>
  );
}
