import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { artistById, artworkBySlug, formatPrice, sellerById } from "@/data/demo";

export const Route = createFileRoute("/kjop/$slug")({
  loader: ({ params }) => {
    const artwork = artworkBySlug(params.slug);
    if (!artwork) throw notFound();
    return { artwork };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Kjøp ${loaderData.artwork.title} | Geargio` : "Kjøp | Geargio" },
      {
        name: "description",
        content: "Trygg kunsthandel: pengene holdes tilbake til du har bekreftet mottak.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const steps = [
  "Kjøper betaler",
  "Pengene reserveres",
  "Selger sender verket",
  "Kjøper bekrefter mottak",
  "Selger får pengene",
];

function CheckoutPage() {
  const { artwork } = Route.useLoaderData();
  const seller = sellerById(artwork.sellerId);
  const [step, setStep] = useState(0);
  const fee = Math.round(artwork.price * 0.05);

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-5">
      <h1 className="font-display text-2xl font-semibold">Trygg kunsthandel</h1>
      <div className="mt-4 flex items-center gap-3 rounded-3xl p-4 glass">
        <img
          src={artwork.image}
          alt={artwork.title}
          width={512}
          height={512}
          className="size-20 rounded-2xl object-cover"
        />
        <div>
          <p className="font-display text-lg">{artwork.title}</p>
          <p className="text-sm text-ink/60">
            {artistById(artwork.artistId).name} · selges av {seller.name}
          </p>
          <p className="mt-1 text-lg font-bold">{formatPrice(artwork.price)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-3xl p-4 text-sm glass">
        <div className="flex justify-between">
          <span>Verk</span>
          <span>{formatPrice(artwork.price)}</span>
        </div>
        <div className="mt-1 flex justify-between text-ink/60">
          <span>Plattformprovisjon (5 %, betales av selger)</span>
          <span>{formatPrice(fee)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-border pt-2 font-bold">
          <span>Å betale</span>
          <span>{formatPrice(artwork.price)}</span>
        </div>
      </div>

      <ol className="mt-4 space-y-2">
        {steps.map((s, i) => (
          <li
            key={s}
            className={`flex items-center gap-3 rounded-2xl p-3 glass ${
              i <= step ? "bg-mint/40" : "opacity-70"
            }`}
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/80 text-xs font-bold">
              {i < step ? <Check className="size-4 text-brandink" /> : i + 1}
            </span>
            <span className="text-sm font-semibold">{s}</span>
          </li>
        ))}
      </ol>

      {step < steps.length - 1 ? (
        <button
          onClick={() => setStep((s) => s + 1)}
          className="mt-4 w-full rounded-2xl bg-brandink py-3 text-sm font-semibold text-primary-foreground"
        >
          {step === 0 ? "Betal trygt gjennom Geargio" : "Neste steg"}
        </button>
      ) : (
        <p className="mt-4 rounded-2xl bg-mint/50 p-4 text-sm font-semibold text-brandink glass">
          Handelen er fullført. Gi gjerne en vurdering av selger.
        </p>
      )}

      <p className="mt-3 text-xs text-ink/50">
        Demoflyt. Betalingsleverandør og escrow kobles på senere.
      </p>
      <Link to="/kunst/$slug" params={{ slug: artwork.slug }} className="mt-4 inline-block text-sm font-semibold text-brandink">
        Tilbake til annonsen
      </Link>
    </main>
  );
}
