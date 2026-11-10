import { Link } from "@tanstack/react-router";
import { Heart, MapPin } from "lucide-react";
import { artistFor, formatPrice, type Artwork } from "@/data/demo";
import { useStore } from "@/lib/store";
import { ArtworkPreview } from "@/components/ArtworkPreview";
import { Button } from "@/components/ui/button";

export function ArtworkCard({ artwork, large = false }: { artwork: Artwork; large?: boolean }) {
  const { isFavorite, toggleFavorite } = useStore();
  const artist = artistFor(artwork);
  const fav = isFavorite(artwork.id);

  return (
    <article className="group overflow-hidden rounded-2xl border-b border-border bg-card">
      <div className="relative overflow-hidden rounded-t-2xl bg-muted">
        <Link to="/kunst/$slug" params={{ slug: artwork.slug }} className="block">
          <ArtworkPreview image={artwork.image} alt={`${artwork.title} av ${artist?.name ?? "ukjent kunstner"}`} large={large} />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleFavorite(artwork.id)}
          aria-label={fav ? "Fjern favoritt" : "Lagre som favoritt"}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-card/90 shadow-sm backdrop-blur"
        >
          <Heart className={`size-4 ${fav ? "fill-brand text-brand" : "text-ink"}`} />
        </Button>
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1">
          {artwork.verified && (
            <span className="rounded-sm bg-card/90 px-2.5 py-1 text-[10px] font-semibold text-brandink backdrop-blur">
              ✓ Verifisert
            </span>
          )}
        </div>
      </div>
      <div className={large ? "px-4 pb-5 pt-4" : "px-3 pb-4 pt-3"}>
        {artist.slug ? (
          <Link
            to="/kunstner/$slug"
            params={{ slug: artist.slug }}
            className={`block truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-brandink hover:text-foreground`}
          >
            {artist.name}
          </Link>
        ) : (
          <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-brandink">{artist.name}</span>
        )}
        <Link to="/kunst/$slug" params={{ slug: artwork.slug }} className="block">
          <p className={`mt-1 truncate font-display font-medium leading-snug ${large ? "text-xl" : "text-[15px]"}`}>{artwork.title}</p>
        </Link>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
          <span className={`shrink-0 font-semibold tabular-nums text-foreground ${large ? "text-base" : "text-sm"}`}>
            {artwork.saleType === "Pris på forespørsel"
              ? "Pris på forespørsel"
              : formatPrice(artwork.saleType === "Auksjon" ? (artwork.currentBid ?? artwork.price) : artwork.price)}
          </span>
          {artwork.location && (
            <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{artwork.location}</span>
            </span>
          )}
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
