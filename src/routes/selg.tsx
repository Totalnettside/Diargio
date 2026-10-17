import { PriceCalculator } from "@/components/PriceCalculator";
import { priceFromPayout } from "@/lib/fees";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Crop, Sparkles, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageCropDialog } from "@/components/ImageCropDialog";
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
import { useAuth } from "@/hooks/useAuth";

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
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      void navigate({ to: "/auth" });
    }
  }, [loading, user, navigate]);

  const [step, setStep] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState("");

  async function addImages(files: File[]) {
    setImageError("");
    const remaining = Math.max(0, 15 - images.length);
    const selected = files.filter((file) => file.type.startsWith("image/")).slice(0, remaining);
    if (selected.length === 0) {
      if (files.length > 0) setImageError(remaining === 0 ? "Du kan legge til opptil 15 bilder." : "Velg en bildefil.");
      return;
    }
    try {
      const urls = await Promise.all(selected.map(compressImage));
      setImages((prev) => [...prev, ...urls].slice(0, 15));
      setOriginalImages((prev) => [...prev, ...urls].slice(0, 15));
    } catch {
      setImageError("Bildet kunne ikke åpnes. Prøv et JPG- eller PNG-bilde.");
    }
  }
  const [artistName, setArtistName] = useState("");
  const [title, setTitle] = useState("");
  const [webArtists, setWebArtists] = useState<{ id: string; label: string; description?: string }[]>([]);
  useEffect(() => {
    const q = artistName.trim();
    if (q.length < 2) { setWebArtists([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(q)}&language=nb&uselang=nb&type=item&limit=15&format=json&origin=*`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((j: { search?: { id: string; label: string; description?: string }[] }) => {
          const re = /(kunstner|maler|billedhugger|skulptør|fotograf|grafiker|tegner|illustratør|artist|painter|sculptor|photographer|printmaker|designer|keramiker)/i;
          setWebArtists((j.search ?? []).filter((x) => x.description && re.test(x.description)).slice(0, 6));
        })
        .catch(() => {});
    }, 300);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [artistName]);
  const [year, setYear] = useState("2026");
  const [category, setCategory] = useState(categories[0] ?? "Malerier");
  const [technique, setTechnique] = useState(techniques[0] ?? "Olje");
  const [style, setStyle] = useState(styles[0] ?? "Abstrakt");
  const [type, setType] = useState(artTypes[0] ?? "Original");
  const [width, setWidth] = useState("60");
  const [height, setHeight] = useState("80");
  const [edition, setEdition] = useState("");
  const [signed, setSigned] = useState(true);
  const [framed, setFramed] = useState(false);
  const [coa, setCoa] = useState(false);
  const [provenance, setProvenance] = useState("");
  const [condition, setCondition] = useState(conditions[0] ?? "Ny");
  const [description, setDescription] = useState("");
  const [saleType, setSaleType] = useState<SaleType>("Fastpris");
  const [price, setPrice] = useState("15000");
  const [artFeeApplies, setArtFeeApplies] = useState(true);
  const [shippingPrice,setShippingPrice]=useState("0");
  const [publishing,setPublishing]=useState(false);
  const [delivery, setDelivery] = useState("Begge deler");
  const [county, setCounty] = useState(counties[0] ?? "Oslo");

  const suggestions = useMemo(
    () =>
      artistName.length > 1
        ? artists.filter((a) => a.name.toLowerCase().includes(artistName.toLowerCase()))
        : [],
    [artistName],
  );

  const priceHint = useMemo(() => {
    const p = Number(price || 0);
    return `Ønsket utbetaling: ${formatPrice(p)}. Sett pris ut fra verket, teknikken og størrelsen.`;
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

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center text-ink/70">
        Sender deg til innlogging …
      </div>
    );
  }
  async function publish() {
    if (images.length === 0 || !title.trim()) { alert("Bilde og verkets navn må fylles inn."); return; }
    if (!toCm(width) || !toCm(height)) {
      alert("Fyll inn gyldig bredde og høyde (f.eks. 42,5).");
      return;
    }
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
      ...(artistName.trim() ? { artistName: artistName.trim() } : {}),
      sellerId: user.id,
      category,
      style,
      technique,
      type,
      condition,
      year: Number(year) || 2026,
      widthCm: toCm(width),
      heightCm: toCm(height),
      ...(edition ? { edition } : {}),
      signed,
      framed,
      coa,
      provenance: provenance || "Ikke oppgitt",
      location: county,
      county,
      saleType,
      price: priceFromPayout(Number(price) || 0, artFeeApplies).total,
      sellerPayout: Number(price) || 0,
      artFeeApplies,
      image: images[0] ?? "",
      views: 0,
      favorites: 0,
      verified: false,
      createdDaysAgo: 0,
      description: description || "Ingen beskrivelse.",
      delivery,
      shippingPrice: delivery === "Må hentes" ? 0 : Number(shippingPrice),
    };
    setPublishing(true);
    try { await addListing(listing); await navigate({ to: "/min-side" }); } catch(e) {setImageError(e instanceof Error?e.message:"Kunne ikke publisere");} finally {setPublishing(false); }
  }

  const maxStep = images.length === 0 ? 0 : !title.trim() ? 2 : stepTitles.length - 1;
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-5">
      <h1 className="font-display text-2xl font-semibold">Legg ut kunst</h1>
      <div className="mt-3 flex gap-1 overflow-x-auto pb-1 no-scrollbar">
        {stepTitles.map((t, i) => (
          <button
            key={t}
            onClick={() => i <= maxStep && setStep(i)}
            disabled={i > maxStep}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold glass disabled:opacity-40 ${
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
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void addImages(Array.from(e.dataTransfer.files));
              }}
              className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-brand/40 bg-card/60 px-4 py-8 text-center text-sm text-muted-foreground"
            >
              <Upload className="size-5 text-brandink" />
              <span>Slipp bildene her</span>
              <div className="flex flex-wrap justify-center gap-3">
                <Button type="button" onClick={() => cameraInput.current?.click()} disabled={images.length >= 15}>
                  <Camera /> Bruk kamera
                </Button>
                <Button type="button" variant="outline" onClick={() => fileInput.current?.click()} disabled={images.length >= 15}>
                  <Upload /> Velg fil
                </Button>
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                aria-label="Velg bildefiler"
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  void addImages(files);
                }}
              />
              <input
                ref={cameraInput}
                type="file"
                accept="image/*"
                capture="environment"
                aria-label="Ta bilde med kamera"
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  void addImages(files);
                }}
              />
            </div>
            {imageError && <p role="alert" className="text-sm text-destructive">{imageError}</p>}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((src, i) => (
                  <div key={i} className="relative min-w-0">
                    <img src={src} alt={`Kunstbilde ${i + 1}`} className="aspect-square w-full rounded-xl bg-card object-contain" />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        setImages((prev) => prev.filter((_, idx) => idx !== i));
                        setOriginalImages((prev) => prev.filter((_, idx) => idx !== i));
                      }}
                      className="absolute right-1 top-1 size-7 rounded-full bg-card"
                      aria-label="Fjern bilde"
                    >
                      <X className="size-3" />
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setCropIndex(i)} aria-label={`Beskjær bilde ${i + 1}`} title="Beskjær bildet" className="mt-2 h-9 w-full gap-1 px-1 text-xs">
                      <Crop /><span className="hidden sm:inline">Beskjær</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
            {webArtists.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">Fra kunstnerdatabasen (Wikidata)</p>
                {webArtists.filter((w) => w.label !== artistName).map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setArtistName(w.label)}
                    className="flex w-full flex-col rounded-2xl bg-white/70 px-3 py-2 text-left text-sm glass"
                  >
                    <span className="font-semibold">{w.label}</span>
                    <span className="text-xs text-muted-foreground">{w.description}</span>
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Valgfritt – trykk «Hopp over» hvis du ikke vil oppgi kunstner.</p>
            {artistName.length > 1 && suggestions.length === 0 && webArtists.length === 0 && (
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
              <Field label="Verkets navn *">
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
              <>
              <Field label={saleType === "Auksjon" ? "Ønsket utbetaling ved startpris (kr)" : "Ønsket utbetaling til deg (kr)"}>
                <input
                  value={price}
                  inputMode="numeric"
                  onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
                  className={inputClass}
                />
              </Field>
              <PriceCalculator payout={Number(price) || 0} artFeeApplies={artFeeApplies} onArtFeeChange={setArtFeeApplies} />
              </>
            )}
            <p className="rounded-2xl bg-white/70 p-3 text-xs text-ink/60 glass">
              <Sparkles className="mr-1 inline size-3.5 text-brandink" />
              {priceHint}
            </p>
          </>
        )}

        {step === 5 && (
          <>
            <p className="font-display text-lg font-semibold">Levering</p>
            {delivery !== "Må hentes" && <Field label="Fraktpris (kr)"><input type="number" min="0" value={shippingPrice} onChange={e=>setShippingPrice(e.target.value)} className={inputClass}/></Field>}
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
                    : formatPrice(priceFromPayout(Number(price) || 0, artFeeApplies).total)}
                </p>
                <p className="mt-2 text-sm text-ink/70">{description || "Ingen beskrivelse."}</p>
              </div>
            </div>
            <button
              disabled={publishing} onClick={()=>void publish()}
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
              onClick={() => step < maxStep ? setStep((s) => s + 1) : alert(images.length === 0 ? "Last opp minst ett bilde før du går videre." : "Skriv inn verkets navn før du går videre.")}
              className="rounded-2xl bg-brandink px-6 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              {step === 1 && !artistName.trim() ? "Hopp over" : "Neste"}
            </button>
          )}
        </div>
      </section>
      {cropIndex !== null && originalImages[cropIndex] && (
        <ImageCropDialog
          key={cropIndex}
          image={originalImages[cropIndex]}
          onClose={() => setCropIndex(null)}
          onSave={(cropped) => setImages((prev) => prev.map((image, i) => i === cropIndex ? cropped : image))}
        />
      )}
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
      const context = c.getContext("2d");
      if (!context) { URL.revokeObjectURL(img.src); reject(new Error("Bildet kunne ikke åpnes.")); return; }
      context.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function toCm(v: string) {
  const n = Number(v.replace(",", ".").trim());
  return Number.isFinite(n) && n > 0 ? n : 0;
}
