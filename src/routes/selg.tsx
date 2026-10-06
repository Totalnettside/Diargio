import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sparkles, Upload, X } from "lucide-react";
import {
  artImages,
  artTypes,
  artists,
  categories,
  conditions,
  counties,
  formatPrice,
  saleTypes,
  styles,
  techniques,
  type Artwork,
  type SaleType,
} from "@/data/demo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/selg")({
  head: () => ({
    meta: [
      { title: "Legg ut kunst til salgs | Diargio" },
      {
        name: "description",
        content:
          "Last opp bilder, fyll inn informasjon om verket og publiser annonsen. Gratis for private selgere.",
      },
      { property: "og:title", content: "Selg kunst på Diargio" },
      { property: "og:description", content: "Legg ut annonsen din på under to minutter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SellPage,
});

const stepTitles = [
  "Bilder",
  "Kunstner",
  "Informasjon",
  "Beskrivelse",
  "Salgsform",
  "Levering",
  "Forhåndsvisning",
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass = "w-full rounded-2xl bg-white/70 px-3 py-2.5 text-sm outline-none glass";

function SellPage() {
  const { addListing } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [artistName, setArtistName] = useState("");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("2026");
  const [category, setCategory] = useState(categories[0]!);
  const [technique, setTechnique] = useState(techniques[0]!);
  const [style, setStyle] = useState(styles[0]!);
  const [type, setType] = useState(artTypes[0]!);
  const [width, setWidth] = useState("60");
  const [height, setHeight] = useState("80");
  const [edition, setEdition] = useState("");
  const [signed, setSigned] = useState(true);
  const [framed, setFramed] = useState(false);
  const [coa, setCoa] = useState(false);
  const [provenance, setProvenance] = useState("");
  const [condition, setCondition] = useState(conditions[0]!);
  const [description, setDescription] = useState("");
  const [saleType, setSaleType] = useState<SaleType>("Fastpris");
  const [price, setPrice] = useState("15000");
  const [delivery, setDelivery] = useState("Begge deler");
  const [county, setCounty] = useState(counties[0]!);

  const suggestions = useMemo(
    () =>
      artistName.length > 1
        ? artists.filter((a) => a.name.toLowerCase().includes(artistName.toLowerCase()))
        : [],
    [artistName],
  );

  const priceHint = useMemo(() => {
    const p = Number(price || 0);
    return `Lignende verk har blitt annonsert mellom ${formatPrice(Math.round(p * 0.75))} og ${formatPrice(Math.round(p * 1.3))}. Dette er ikke en profesjonell kunsttakst.`;
  }, [price]);

  function writeWithAi() {
    setDescription(
      `${title || "Verket"} er et ${technique.toLowerCase()}verk${artistName ? ` av ${artistName}` : ""} fra ${year}. ` +
        `Stilen er ${style.toLowerCase()} og verket måler ${width} × ${height} cm. ` +
        `${signed ? "Verket er signert. " : ""}${framed ? "Det leveres innrammet. " : "Det leveres uinnrammet. "}` +
        `${coa ? "Ekthetsbevis følger med. " : ""}Tilstanden er beskrevet som ${condition.toLowerCase()}. ` +
        `Verket selges fra ${county}.`,
    );
  }

  function publish() {
    const slug = `${(title || "nytt-verk")
      .toLowerCase()
      .replace(/[^a-z0-9æøå ]/g, "")
      .trim()
      .replace(/\s+/g, "-")}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const listing: Artwork = {
      id: `my${Date.now()}`,
      slug,
      title: title || "Nytt verk",
      artistId: artists.find((a) => a.name === artistName)?.id ?? "self",
      sellerId: "s1",
      category,
      style,
      technique,
      type,
      condition,
      year: Number(year) || 2026,
      widthCm: Number(width) || 0,
      heightCm: Number(height) || 0,
      ...(edition ? { edition } : {}),
      signed,
      framed,
      coa,
      provenance: provenance || "Ikke oppgitt",
      location: county,
      county,
      saleType,
      price: Number(price) || 0,
      image: images[0] ?? artImages[0]!,
      views: 0,
      favorites: 0,
      verified: false,
      createdDaysAgo: 0,
      description: description || "Ingen beskrivelse.",
      delivery,
    };
    addListing(listing);
    void navigate({ to: "/min-side" });
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-5">
      <h1 className="font-display text-2xl font-semibold">Legg ut kunst</h1>
      <div className="mt-3 flex gap-1 overflow-x-auto pb-1 no-scrollbar">
        {stepTitles.map((t, i) => (
          <button
            key={t}
            onClick={() => setStep(i)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold glass ${
              i === step ? "bg-brandink text-primary-foreground" : "bg-white/60"
            }`}
          >
            {i + 1}. {t}
          </button>
        ))}
      </div>

      <section className="mt-4 space-y-4 rounded-3xl p-5 glass">
        {step === 0 && (
          <>
            <p className="font-display text-lg font-semibold">Last opp bilder</p>
            <p className="text-sm text-ink/60">Dra og slipp eller velg opptil 15 bilder.</p>
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const files = Array.from(e.dataTransfer.files).slice(0, 15);
                void Promise.all(files.map(compressImage)).then((urls) => setImages((prev) => [...prev, ...urls].slice(0, 15)));
              }}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-brand/40 bg-white/50 px-4 py-10 text-center text-sm text-ink/60"
            >
              <Upload className="size-5 text-brandink" />
              Slipp bildene her, eller trykk for å velge
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  void Promise.all(files.map(compressImage)).then((urls) =>
                    setImages((prev) => [...prev, ...urls].slice(0, 15)),
                  );
                }}
              />
            </label>
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((src, i) => (
                  <div key={src} className="relative">
                    <img src={src} alt="" className="aspect-square w-full rounded-xl object-cover" />
                    <button
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-white/85"
                      aria-label="Fjern bilde"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setImages(artImages.slice(0, 3) as string[])}
              className="flex items-center gap-2 rounded-2xl bg-lav/60 px-4 py-2 text-xs font-semibold text-brandink glass"
            >
              <Sparkles className="size-3.5" /> Bruk demobilder
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <p className="font-display text-lg font-semibold">Hvem er kunstneren?</p>
            <input
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="Søk i kunstnerdatabasen"
              className={inputClass}
            />
            {suggestions.length > 0 && (
              <div className="space-y-1">
                {suggestions.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setArtistName(a.name)}
                    className="flex w-full items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 text-left text-sm glass"
                  >
                    <img src={a.avatar} alt="" className="size-8 rounded-full object-cover" />
                    {a.name}
                  </button>
                ))}
              </div>
            )}
            {artistName.length > 1 && suggestions.length === 0 && (
              <p className="rounded-2xl bg-peach/40 p-3 text-sm glass">
                Fant ikke «{artistName}». Den legges til som ny kunstner når du publiserer.
              </p>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <p className="font-display text-lg font-semibold">Informasjon om verket</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Verkets navn">
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
              </Field>
              <Field label="År">
                <input value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Kategori">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Teknikk">
                <select value={technique} onChange={(e) => setTechnique(e.target.value)} className={inputClass}>
                  {techniques.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Stil">
                <select value={style} onChange={(e) => setStyle(e.target.value)} className={inputClass}>
                  {styles.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Type">
                <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
                  {artTypes.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Bredde (cm)">
                <input value={width} onChange={(e) => setWidth(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Høyde (cm)">
                <input value={height} onChange={(e) => setHeight(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Opplag / nummer">
                <input
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                  placeholder="f.eks. 24/150"
                  className={inputClass}
                />
              </Field>
              <Field label="Tilstand">
                <select value={condition} onChange={(e) => setCondition(e.target.value)} className={inputClass}>
                  {conditions.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Fylke">
                <select value={county} onChange={(e) => setCounty(e.target.value)} className={inputClass}>
                  {counties.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ["Signert", signed, setSigned] as const,
                ["Innrammet", framed, setFramed] as const,
                ["Ekthetsbevis", coa, setCoa] as const,
              ].map(([label, value, setter]) => (
                <button
                  key={label}
                  onClick={() => setter(!value)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold glass ${
                    value ? "bg-mint/70 text-brandink" : "bg-white/60"
                  }`}
                >
                  {label}: {value ? "Ja" : "Nei"}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="font-display text-lg font-semibold">Beskrivelse</p>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fortell om verket, historikken og tilstanden …"
              className={inputClass}
            />
            <button
              onClick={writeWithAi}
              className="flex items-center gap-2 rounded-2xl bg-lav/70 px-4 py-2.5 text-sm font-semibold text-brandink glass"
            >
              <Sparkles className="size-4" /> Skriv annonsetekst med AI
            </button>
            <p className="text-xs text-ink/50">
              Forslaget er basert på informasjonen du har fylt inn. Du må godkjenne teksten før
              publisering.
            </p>
          </>
        )}

        {step === 4 && (
          <>
            <p className="font-display text-lg font-semibold">Salgsform</p>
            <div className="flex flex-wrap gap-2">
              {saleTypes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSaleType(s)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold glass ${
                    saleType === s ? "bg-brandink text-primary-foreground" : "bg-white/60"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {saleType !== "Pris på forespørsel" && (
              <Field label={saleType === "Auksjon" ? "Startpris" : "Pris"}>
                <input
                  value={price}
                  inputMode="numeric"
                  onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
                  className={inputClass}
                />
              </Field>
            )}
            <p className="rounded-2xl bg-white/70 p-3 text-xs text-ink/60 glass">
              <Sparkles className="mr-1 inline size-3.5 text-brandink" />
              AI prisassistent: {priceHint}
            </p>
          </>
        )}

        {step === 5 && (
          <>
            <p className="font-display text-lg font-semibold">Levering</p>
            <div className="flex flex-wrap gap-2">
              {["Kan sendes", "Må hentes", "Begge deler"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDelivery(d)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold glass ${
                    delivery === d ? "bg-brandink text-primary-foreground" : "bg-white/60"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <p className="font-display text-lg font-semibold">Forhåndsvisning</p>
            <div className="overflow-hidden rounded-2xl glass">
              <img
                src={images[0] ?? artImages[0]}
                alt=""
                className="aspect-square w-full object-cover"
              />
              <div className="p-4">
                <p className="text-sm font-semibold">{artistName || "Ukjent kunstner"}</p>
                <p className="font-display text-lg">{title || "Uten tittel"}</p>
                <p className="mt-1 text-lg font-bold">
                  {saleType === "Pris på forespørsel"
                    ? "Pris på forespørsel"
                    : formatPrice(Number(price) || 0)}
                </p>
                <p className="mt-2 text-sm text-ink/70">{description || "Ingen beskrivelse."}</p>
              </div>
            </div>
            <button
              onClick={publish}
              className="w-full rounded-2xl bg-brandink py-3 text-sm font-semibold text-primary-foreground"
            >
              Publiser annonse
            </button>
          </>
        )}

        <div className="flex justify-between pt-2">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-2xl bg-white/70 px-4 py-2.5 text-sm font-semibold text-brandink glass disabled:opacity-40"
          >
            Tilbake
          </button>
          {step < stepTitles.length - 1 && (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="rounded-2xl bg-brandink px-6 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Neste
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const max = 1400;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
