import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Printer, Share2, ShieldCheck, Star } from "lucide-react";
import { addRecent } from "@/lib/recent";
import { BidDialog } from "@/components/BidDialog";
import { StripeBadge } from "@/components/StripeBadge";
import { ArtworkCard } from "@/components/ArtworkCard";
import {
  artistById,
  artworkBySlug,
  artworksBySeller,
  countdown,
  formatPrice,
  sellerById,
} from "@/data/demo";
import type { Artwork } from "@/data/demo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/kunst/$slug")({
  loader: ({ params }) => {
    const artwork = artworkBySlug(params.slug) ?? null;
    return { artwork, artistName: artwork ? artistById(artwork.artistId).name : "" };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.artwork) {
        return { meta: [{ title: "Annonse | Diargio" }, { name: "robots", content: "noindex" }] };
    }
    const { artwork, artistName } = loaderData;
    const title = `${artistName} – ${artwork.title} til salgs | Diargio`;
    const description = `${artwork.title} av ${artistName}, ${artwork.technique.toLowerCase()}, ${artwork.widthCm} × ${artwork.heightCm} cm. ${formatPrice(artwork.price)} i ${artwork.location}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: artwork.title,
            brand: artistName,
            offers: {
              "@type": "Offer",
              price: artwork.price,
              priceCurrency: "NOK",
              availability: "https://schema.org/InStock",
            },
          }),
        },
      ],
    };
  },
  component: ArtworkPage,
});

function ArtworkPage() {
  const { artwork: demo } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { allArtworks } = useStore();
  const artwork = demo ?? allArtworks.find((a) => a.slug === slug);
  if (!artwork) {
    return (
      <main className="mx-auto max-w-xl px-5 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Fant ikke annonsen</h1>
        <Link to="/kunst" className="mt-4 inline-block text-sm font-semibold text-brandink">Tilbake til kunst</Link>
      </main>
    );
  }
  return <ArtworkView artwork={artwork} />;
}

function ArtworkView({ artwork }: { artwork: Artwork }) {
  const artist = artistById(artwork.artistId);
  const seller = sellerById(artwork.sellerId);
  const { isFavorite, toggleFavorite, sendMessage, toggleFollowSeller, followedSellers } = useStore();
  const [bidOpen, setBidOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => addRecent(artwork.id), [artwork.id]);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [roomImage, setRoomImage] = useState<string | null>(null);
  const navigate = useNavigate();
  const others = artworksBySeller(seller.id).filter((a) => a.id !== artwork.id).slice(0, 3);

  const facts: Array<[string, string]> = [
    ["Kunstner", artist.name],
    ["Årstall", String(artwork.year)],
    ["Teknikk", artwork.technique],
    ["Kategori", artwork.category],
    ["Stil", artwork.style],
    ["Type", artwork.type],
    ["Opplag", artwork.edition ?? "Unikt verk"],
    ["Signert", artwork.signed ? "Ja" : "Nei"],
    ["Størrelse", `${artwork.widthCm} × ${artwork.heightCm} cm`],
    ["Innramming", artwork.framed ? "Innrammet" : "Ikke innrammet"],
    ["Tilstand", artwork.condition],
    ["Levering", artwork.delivery],
    ["Lokasjon", `${artwork.location}, ${artwork.county}`],
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-5">
      <span className="inline-block rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
        Demodata
      </span>

      <div className="mt-3 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-3xl glass-lift">
            <img
              src={roomImage ?? artwork.image}
              alt={`${artwork.title} av ${artist.name}`}
              width={1024}
              height={1024}
              className="aspect-square w-full object-cover"
            />
          </div>
          {roomImage && (
            <p className="mt-2 text-xs text-ink/60">
              Romvisning: verket vises omtrentlig i {artwork.widthCm} × {artwork.heightCm} cm.
            </p>
          )}
          <label className="mt-3 block w-full cursor-pointer rounded-2xl bg-white/70 px-4 py-3 text-center text-sm font-semibold text-brandink glass">
            Se kunsten på veggen
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setRoomImage(URL.createObjectURL(file));
              }}
            />
          </label>

          <h1 className="mt-5 font-display text-3xl font-semibold">{artwork.title}</h1>
          <Link
            to="/kunstner/$slug"
            params={{ slug: artist.slug }}
            className="text-sm font-semibold text-brandink"
          >
            {artist.name}
          </Link>

          <dl className="mt-4 grid grid-cols-2 gap-3 rounded-3xl p-4 glass">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">{k}</dt>
                <dd className="text-sm">{v}</dd>
              </div>
            ))}
          </dl>

          {artwork.coa && (
            <p className="mt-3 flex items-center gap-2 rounded-2xl bg-mint/50 px-4 py-3 text-sm font-semibold text-brandink glass">
              <ShieldCheck className="size-4" /> Dokumentasjon på ekthet registrert
            </p>
          )}

          <p className="mt-4 text-sm leading-relaxed text-ink/70">{artwork.description}</p>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl p-5 glass-lift">
            {artwork.saleType === "Auksjon" ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                  Nåværende bud
                </p>
                <p className="font-display text-3xl font-semibold">
                  {formatPrice(artwork.currentBid ?? artwork.price)}
                </p>
                <p className="mt-1 text-sm text-ink/60">
                  {artwork.bidCount} bud · Tid igjen {countdown(artwork.auctionEndsInMin ?? 0)}
                </p>
                <p className="text-xs text-ink/45">
                  Minste budøkning {formatPrice(artwork.minIncrement ?? 500)}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Pris</p>
                <p className="font-display text-3xl font-semibold">
                  {artwork.saleType === "Pris på forespørsel"
                    ? "Pris på forespørsel"
                    : formatPrice(artwork.price)}
                </p>
                <p className="mt-1 text-sm text-ink/60">{artwork.saleType}</p>
              </>
            )}

            <div className="mt-4 flex flex-col gap-2">
              {artwork.saleType !== "Pris på forespørsel" && (
                <button
                  onClick={() => void navigate({ to: "/kjop/$slug", params: { slug: artwork.slug } })}
                  className="rounded-2xl bg-brandink py-3 text-sm font-semibold text-primary-foreground"
                >
                  Kjøp nå · {formatPrice(artwork.price)}
                </button>
              )}
              <button
                onClick={() => setBidOpen(true)}
                className="rounded-2xl bg-lav/70 py-3 text-sm font-semibold text-brandink glass"
              >
                {artwork.saleType === "Auksjon" ? "Legg inn bud" : "Gi bud"}
              </button>
              <Link
                to="/dealroom/$slug"
                params={{ slug: artwork.slug }}
                className="rounded-2xl border border-brand/50 py-3 text-center text-sm font-semibold text-brandink"
              >
                Åpne dealroom
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleFavorite(artwork.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/70 py-3 text-sm font-semibold glass"
                >
                  <Heart
                    className={`size-4 ${isFavorite(artwork.id) ? "fill-brand text-brand" : ""}`}
                  />
                  {isFavorite(artwork.id) ? "Lagret" : "Lagre"}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShareOpen((v) => !v)}
                    className="flex h-full items-center justify-center gap-2 rounded-2xl bg-white/70 px-4 py-3 text-sm font-semibold glass"
                  >
                    <Share2 className="size-4" /> Del
                  </button>
                  {shareOpen && (
                    <div className="absolute right-0 z-20 mt-2 w-52 rounded-2xl bg-background p-2 text-sm shadow-lg ring-1 ring-border">
                      {(() => {
                        const url = typeof window !== "undefined" ? window.location.href : "";
                        const text = `${artwork.title} av ${artist.name}`;
                        const e = encodeURIComponent;
                        const links: Array<[string, string]> = [
                          ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`],
                          ["X / Twitter", `https://twitter.com/intent/tweet?url=${e(url)}&text=${e(text)}`],
                          ["LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`],
                          ["E-post", `mailto:?subject=${e(text)}&body=${e(url)}`],
                        ];
                        return (
                          <>
                            <button
                              onClick={() => {
                                void navigator.clipboard?.writeText(url);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1500);
                              }}
                              className="block w-full rounded-xl px-3 py-2 text-left hover:bg-secondary"
                            >
                              {copied ? "Lenke kopiert ✓" : "Kopier lenke"}
                            </button>
                            {links.map(([label, href]) => (
                              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="block rounded-xl px-3 py-2 hover:bg-secondary">
                                {label}
                              </a>
                            ))}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white/70 py-3 text-sm font-semibold glass print:hidden"
              >
                <Printer className="size-4" /> Skriv ut / lagre som PDF
              </button>
            </div>
          </div>

          <div className="rounded-3xl p-5 glass">
            <div className="flex items-center gap-3">
              <img
                src={seller.avatar}
                alt={seller.name}
                loading="lazy"
                width={512}
                height={512}
                className="size-12 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold">{seller.name}</p>
                {seller.verified && (
                  <p className="text-xs font-semibold text-brandink">✓ Verifisert {seller.type.toLowerCase()}</p>
                )}
                <p className="flex items-center gap-1 text-xs text-ink/60">
                  <Star className="size-3 fill-brand text-brand" /> {seller.rating.toFixed(1)} ·{" "}
                  {seller.reviewCount} vurderinger
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-ink/50">
              Medlem siden {seller.memberSince} · Svarer på {seller.responseRate}% av henvendelser
            </p>

            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Skriv en melding til selger …"
              className="mt-3 w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none glass"
            />
            <button
              onClick={() => {
                if (!message.trim()) return;
                sendMessage(artwork.id, message.trim());
                setMessage("");
                setSent(true);
              }}
              className="mt-2 w-full rounded-2xl bg-brandink py-3 text-sm font-semibold text-primary-foreground"
            >
              Send melding
            </button>
            {sent && (
              <p className="mt-2 text-xs font-semibold text-brandink">
                Meldingen er sendt.{" "}
                <Link to="/meldinger" className="underline">
                  Gå til meldinger
                </Link>
              </p>
            )}
            <div className="mt-2 flex gap-2">
              <Link
                to="/profil/$slug"
                params={{ slug: seller.slug }}
                className="flex-1 rounded-2xl bg-white/70 py-2.5 text-center text-sm font-semibold text-brandink glass"
              >
                Se profil
              </Link>
              <button
                onClick={() => toggleFollowSeller(seller.id)}
                className="flex-1 rounded-2xl bg-lav/70 py-2.5 text-sm font-semibold text-brandink glass"
              >
                {followedSellers.includes(seller.id) ? "Følger" : "Følg selger"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl p-5 glass">
            <p className="text-sm font-bold">Trygg kunsthandel</p>
            <p className="mt-1 text-xs leading-relaxed text-ink/60">
              Betal gjennom Diargio. Pengene holdes tilbake til du har bekreftet mottak. Totalt 25 % gebyr tilkommer: 20 % Diargio-gebyr og 5 % kunstavgift.
            </p>
            <div className="mt-3">
              <StripeBadge />
            </div>
          </div>
        </aside>
      </div>

      {others.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold">Flere annonser fra {seller.name}</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
            {others.map((a) => (
              <ArtworkCard key={a.id} artwork={a} />
            ))}
          </div>
        </section>
      )}

      {bidOpen && <BidDialog artwork={artwork} onClose={() => setBidOpen(false)} />}
    </main>
  );
}
