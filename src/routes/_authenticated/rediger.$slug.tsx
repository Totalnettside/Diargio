import { PriceCalculator } from "@/components/PriceCalculator";
import { breakdownFromTotal, priceFromPayout } from "@/lib/fees";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  artTypes,
  categories,
  conditions,
  counties,
  formatPrice,
  saleTypes,
  styles,
  techniques,
  type SaleType,
} from "@/data/demo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/rediger/$slug")({
  head: () => ({
    meta: [
      { title: "Endre annonse | Diargio" },
      { name: "description", content: "Rediger eller slett annonsen din." },
      { property: "og:title", content: "Endre annonse | Diargio" },
      { property: "og:description", content: "Rediger eller slett annonsen din." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EditListingPage,
});

const inputClass = "w-full rounded-2xl bg-white/70 px-3 py-2.5 text-sm outline-none glass";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function EditListingPage() {
  const { slug } = Route.useParams();
  const { myListings, updateListing, deleteListing } = useStore();
  const navigate = useNavigate();
  const listing = myListings.find((l) => l.slug === slug);

  const [shippingPrice,setShippingPrice]=useState(String(listing?.shippingPrice??0));
  const [saveError,setSaveError]=useState("");
  const [title, setTitle] = useState(listing?.title ?? "");
  const [price, setPrice] = useState(String(listing ? (listing.sellerPayout ?? breakdownFromTotal(listing.price, listing.artFeeApplies ?? true).payout) : ""));
  const [artFeeApplies, setArtFeeApplies] = useState(listing?.artFeeApplies ?? true);
  const [category, setCategory] = useState(listing?.category ?? categories[0] ?? "Malerier");
  const [style, setStyle] = useState(listing?.style ?? styles[0] ?? "Abstrakt");
  const [technique, setTechnique] = useState(listing?.technique ?? techniques[0] ?? "Olje");
  const [type, setType] = useState(listing?.type ?? artTypes[0] ?? "Original");
  const [condition, setCondition] = useState(listing?.condition ?? conditions[0] ?? "Ny");
  const [saleType, setSaleType] = useState<SaleType>(listing?.saleType ?? "Fastpris");
  const [county, setCounty] = useState(listing?.county ?? counties[0] ?? "Oslo");
  const [description, setDescription] = useState(listing?.description ?? "");

  useEffect(()=>{if(listing){setTitle(listing.title);setPrice(String(listing.sellerPayout??breakdownFromTotal(listing.price,listing.artFeeApplies??true).payout));setShippingPrice(String(listing.shippingPrice??0));}},[listing?.id]);

  if (!listing) {
    return (
      <main className="mx-auto w-full max-w-2xl px-5 py-10 text-center">
        <h1 className="font-display text-2xl font-semibold">Fant ikke annonsen</h1>
        <p className="mt-2 text-sm text-ink/60">
          Denne annonsen finnes ikke, eller den er ikke lagt ut fra denne nettleseren.
        </p>
        <Link
          to="/min-side"
          className="mt-4 inline-block rounded-2xl bg-brandink px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Til Min side
        </Link>
      </main>
    );
  }

  async function save() {
    if(!listing)return;
    try {await updateListing({
      ...listing,
      title: title || listing.title,
      ...(Number(price) ? { price: priceFromPayout(Number(price), artFeeApplies).total, sellerPayout: Number(price), artFeeApplies } : {}),
      category,
      style,
      technique,
      type,
      condition,
      saleType,
      county,
      shippingPrice:Number(shippingPrice),
      description: description || listing.description,
    });
    await navigate({ to: "/kunst/$slug", params: { slug: listing.slug } });
    }catch(e){setSaveError(e instanceof Error?e.message:"Kunne ikke lagre");}
  }

  async function remove() {
    if(!listing)return;
    if (window.confirm(`Slette «${listing.title}»? Dette kan ikke angres.`)) {
      try{await deleteListing(listing.id);await navigate({ to: "/min-side" });}catch(e){setSaveError(e instanceof Error?e.message:"Kunne ikke slette");}
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-5">
      <h1 className="font-display text-2xl font-semibold">Endre annonse</h1>
      <p className="mt-1 text-sm text-ink/60">«{listing.title}» · {formatPrice(listing.price)}</p>

      {saveError&&<p role="alert" className="text-destructive">{saveError}</p>}
      <section className="mt-4 space-y-4 rounded-3xl p-5 glass">
        <Field label="Tittel">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ønsket utbetaling (kr)">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              className={inputClass}
            />
          </Field>
          <Field label="Salgsform">
            <select value={saleType} onChange={(e) => setSaleType(e.target.value as SaleType)} className={inputClass}>
              {saleTypes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Fraktpris (kr)"><input type="number" min="0" className={inputClass} value={shippingPrice} onChange={e=>setShippingPrice(e.target.value)} /></Field>
        <PriceCalculator payout={Number(price) || 0} artFeeApplies={artFeeApplies} onArtFeeChange={setArtFeeApplies} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kategori">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Stil">
            <select value={style} onChange={(e) => setStyle(e.target.value)} className={inputClass}>
              {styles.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Teknikk">
            <select value={technique} onChange={(e) => setTechnique(e.target.value)} className={inputClass}>
              {techniques.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Type">
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
              {artTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tilstand">
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className={inputClass}>
              {conditions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Fylke">
            <select value={county} onChange={(e) => setCounty(e.target.value)} className={inputClass}>
              {counties.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Beskrivelse">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className={inputClass}
          />
        </Field>
      </section>

      <div className="mt-4 flex gap-2">
        <button
          onClick={save}
          className="flex-1 rounded-2xl bg-brandink px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Lagre endringer
        </button>
        <button
          onClick={remove}
          className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 glass"
        >
          Slett annonsen
        </button>
      </div>
    </main>
  );
}
