import { PriceCalculator } from "@/components/PriceCalculator";
import { priceFromPayout } from "@/lib/fees";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { submissionDisclosure } from '@/lib/moderation';
import {useActionDialog} from '@/components/ActionDialogs';
import { pageHead } from '@/lib/seo';
import { clearResolvedTitleError, missingTitleMessage } from '@/lib/sell-validation';

export const Route = createFileRoute("/selg")({
  head: () => pageHead({
    title: "Selg kunst på Diargio",
    description: "Det koster ingenting å legge ut en annonse. Diargios provisjon er 20 % av verkets avtalte salgspris ved gjennomført salg.",
    path: "/selg",
    breadcrumbs: [{ name: "Forsiden", path: "/" }, { name: "Selg kunst", path: "/selg" }],
  }),
  component: SellPage,
});

function SellLanding() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Selg kunst på Diargio</h1>
      <p className="mt-3 text-lg text-ink/70">
        Det koster ingenting å legge ut en annonse. Diargios provisjon er 20 % av verkets avtalte salgspris ved gjennomført salg.
      </p>
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Slik selger du</h2>
        <p className="mt-2 text-ink/80">Opprett en bruker og presenter verket med gode bilder, en beskrivelse og ønsket pris. Fortell om materialene, størrelsen og historien bak.</p>
        <p className="mt-2 text-ink/80">Vi gjennomgår alle nye annonser før de publiseres, slik at opplysningene er tydelige og presentasjonen følger Diargios retningslinjer. Gjennomgangen innebærer ikke en verdivurdering eller bekreftelse av verkets ekthet.</p>
        <p className="mt-2 text-ink/80">Du får varsel når noen sender en melding eller gir et bud. Du bestemmer selv hvilke bud du vil godta.</p>
        <p className="mt-2 text-ink/80">Betalingen håndteres gjennom Stripe. Provisjonen trekkes fra selgerens oppgjør. Levering avtales med kjøperen.</p>
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Pris</h2>
        <p className="mt-2 text-ink/80">Det koster ingenting å legge ut kunst. Provisjon og eventuell kunstavgift gjelder når verket selges.</p>
        <p className="mt-2 text-ink/80">Provisjonen er 20 % av verkets avtalte salgspris og beregnes av salgsprisen før kunstavgift, frakt og eventuell transportforsikring.</p>
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link to="/info/$page" params={{ page: "priser-og-gebyrer" }} className="underline">Priser og gebyrer</Link>
          <Link to="/info/$page" params={{ page: "guide-til-a-selge-kunst" }} className="underline">Guide til å selge kunst</Link>
        </p>
      </section>
      <Link to="/auth" className="mt-10 inline-block rounded-md bg-sage px-5 py-2.5 text-sm font-medium text-white hover:bg-sagelight">
        Logg inn eller opprett konto
      </Link>
    </article>
  );
}

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

const inputClass = "sell-input w-full rounded-2xl px-4 py-3 text-sm outline-none";

function SellPage() {
  const dialog=useActionDialog();
  const { addListing } = useStore();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const stepperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stepper = stepperRef.current;
    const active = stepper?.querySelector<HTMLElement>('[aria-current="step"]');
    if (stepper && active) stepper.scrollTo({ left: active.offsetLeft - (stepper.clientWidth - active.clientWidth) / 2, behavior: "smooth" });
  }, [step]);
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
  const [sellerType,setSellerType] = useState<'Kunstner'|'Privat'|'Galleri'>('Kunstner');
  const [ownWork,setOwnWork] = useState(true);

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

  if (!user) return <SellLanding />;
  async function publish(draft = false) {
    if(!user)return;
    if (images.length === 0 || !title.trim()) { setImageError('Last opp minst ett bilde og fyll inn verkets navn.'); return; }
    if (!draft && (!toCm(width) || !toCm(height))) {
      setImageError('Fyll inn gyldig bredde og høyde (f.eks. 42,5).');setStep(2);
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
      images,
      sellerType,
      ownWork,
      views: 0,
      favorites: 0,
      verified: false,
      createdDaysAgo: 0,
      description: description.trim(),
      delivery,
      shippingPrice: delivery === "Må hentes" ? 0 : Number(shippingPrice),
    };
    setPublishing(true);
    try { await addListing(listing,draft); await navigate({ to: "/min-side",search:{tab:'Mine annonser'} }); } catch(e) {setImageError(e instanceof Error?e.message:"Kunne ikke sende inn");} finally {setPublishing(false); }
  }

  const maxStep = images.length === 0 ? 0 : !title.trim() ? 2 : stepTitles.length - 1;
  return (
    <main className="sell-flow mx-auto w-full max-w-6xl px-5 py-6 sm:px-8">
      <header className="sell-flow-hero">
        <div>
          <p className="sell-flow-eyebrow">Fra kunstner til ny eier</p>
          <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Legg ut kunst</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-nav-highlight/80 sm:text-base">
            Presenter verket med gode bilder og en tydelig historie. Vi hjelper deg steg for steg.
          </p>
        </div>
        <div className="sell-flow-hero-note">
          <span>Gratis å legge ut</span>
          <strong>Du godkjenner alt før innsending</strong>
        </div>
      </header>
      {imageError&&<p role="alert" className="sell-flow-error mt-4 text-sm text-destructive">{imageError}</p>}
      <div className="sell-progress-meta">
        <span>Steg {step + 1} av {stepTitles.length}</span>
        <span>{stepTitles[step]}</span>
      </div>
      <div className="sell-progress-track" aria-hidden="true"><span style={{ width: `${((step + 1) / stepTitles.length) * 100}%` }} /></div>
      <div ref={stepperRef} className="sell-stepper mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar" aria-label="Steg i annonsen">
        {stepTitles.map((t, i) => (
          <button
            key={t}
            onClick={() => i <= maxStep && setStep(i)}
            disabled={i > maxStep}
            aria-current={i === step ? "step" : undefined}
            className={`sell-step-button ${i === step ? "is-current" : ""} ${i < step ? "is-complete" : ""}`}
          >
            <span>{i + 1}</span>{t}
          </button>
        ))}
      </div>

      <div className="sell-flow-workspace">
      <section className="sell-panel mt-5 space-y-5 rounded-3xl p-5 sm:p-7">
        {step === 0 && (
          <>
            <div className="sell-step-heading"><span>01</span><h2 className="font-display text-2xl font-semibold">Last opp bilder</h2></div>
            <p className="text-sm text-ink/60">Dra og slipp eller velg opptil 15 bilder.</p>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void addImages(Array.from(e.dataTransfer.files));
              }}
              className="sell-upload-zone flex flex-col items-center gap-4 rounded-2xl border border-dashed px-4 py-10 text-center text-sm"
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
                      onClick={() => dialog({title:'Slette bildet?',description:'Vil du fjerne dette bildet fra annonsen?',confirmLabel:'Slett bildet',destructive:true,action:() => {
                        setImages((prev) => prev.filter((_, idx) => idx !== i));
                        setOriginalImages((prev) => prev.filter((_, idx) => idx !== i));
                      }})}
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
            <div className="sell-step-heading"><span>02</span><h2 className="font-display text-2xl font-semibold">Hvem er kunstneren?</h2></div>
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
                    className="flex w-full items-center gap-2 rounded-2xl bg-card/80 px-3 py-2 text-left text-sm glass"
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
                    className="flex w-full flex-col rounded-2xl bg-card/80 px-3 py-2 text-left text-sm glass"
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
            <div className="sell-step-heading"><span>03</span><h2 className="font-display text-2xl font-semibold">Informasjon om verket</h2></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Selgertype"><select value={sellerType} onChange={e=>setSellerType(e.target.value as typeof sellerType)} className={inputClass}>{['Kunstner','Privat','Galleri'].map(t=><option key={t}>{t}</option>)}</select></Field>
              <Field label="Eget verk eller videresalg"><select value={ownWork?'own':'resale'} onChange={e=>setOwnWork(e.target.value==='own')} className={inputClass}><option value="own">Eget verk</option><option value="resale">Videresalg</option></select></Field>
              <Field label="Verkets navn *">
                <input value={title} onChange={(e) => {
                  const value = e.target.value;
                  setTitle(value);
                  setImageError((error) => clearResolvedTitleError(error, value));
                }} className={inputClass} />
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
                    value ? "bg-mint/70 text-brandink" : "bg-card/70"
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
            <div className="sell-step-heading"><span>04</span><h2 className="font-display text-2xl font-semibold">Beskrivelse</h2></div>
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
            <div className="sell-step-heading"><span>05</span><h2 className="font-display text-2xl font-semibold">Salgsform</h2></div>
            <div className="flex flex-wrap gap-2">
              {saleTypes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSaleType(s)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold glass ${
                    saleType === s ? "bg-brandink text-primary-foreground" : "bg-card/70"
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
            <p className="rounded-2xl bg-card/80 p-3 text-xs text-ink/60 glass">
              <Sparkles className="mr-1 inline size-3.5 text-brandink" />
              {priceHint}
            </p>
          </>
        )}

        {step === 5 && (
          <>
            <div className="sell-step-heading"><span>06</span><h2 className="font-display text-2xl font-semibold">Levering</h2></div>
            {delivery !== "Må hentes" && <Field label="Fraktpris (kr)"><input type="number" min="0" value={shippingPrice} onChange={e=>setShippingPrice(e.target.value)} className={inputClass}/></Field>}
            <div className="flex flex-wrap gap-2">
              {["Kan sendes", "Må hentes", "Begge deler"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDelivery(d)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold glass ${
                    delivery === d ? "bg-brandink text-primary-foreground" : "bg-card/70"
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
            <div className="sell-step-heading"><span>07</span><h2 className="font-display text-2xl font-semibold">Forhåndsvisning</h2></div>
            <div className="overflow-hidden rounded-2xl glass">
              <img
                src={images[0] ?? artImages[0]}
                alt=""
                className="aspect-square w-full object-contain"
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
            <p className="text-sm text-muted-foreground">{submissionDisclosure}</p>
            <Button className="w-full" disabled={publishing} onClick={()=>void publish()}>Send til godkjenning</Button>
          </>
        )}

        <div className="flex justify-between pt-2">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-2xl bg-card/80 px-4 py-2.5 text-sm font-semibold text-brandink glass disabled:opacity-40"
          >
            Tilbake
          </button>
          {step < stepTitles.length - 1 && (
            <button
              onClick={() => step < maxStep ? setStep((s) => s + 1) : setImageError(images.length === 0 ? "Last opp minst ett bilde før du går videre." : missingTitleMessage)}
              className="rounded-2xl bg-brandink px-6 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              {step === 1 && !artistName.trim() ? "Hopp over" : "Neste"}
            </button>
          )}
        </div>
      </section>
      <aside className="sell-live-preview" aria-label="Forhåndsvisning av annonsen">
        <p className="sell-flow-eyebrow">Din annonse</p>
        <div className="sell-live-image">
          {images[0] ? <img src={images[0]} alt="Første bilde i annonsen" /> : <><Upload /><span>Bildet ditt vises her</span></>}
        </div>
        <div className="sell-live-copy">
          <p>{artistName || "Kunstner kan legges til senere"}</p>
          <h2>{title || "Verkets navn"}</h2>
          <strong>{saleType === "Pris på forespørsel" ? "Pris på forespørsel" : formatPrice(priceFromPayout(Number(price) || 0, artFeeApplies).total)}</strong>
        </div>
        <div className="sell-live-checklist">
          <span className={images.length ? "is-done" : ""}>{images.length ? `${images.length} bilde${images.length === 1 ? "" : "r"} lagt til` : "Legg til det første bildet"}</span>
          <span className={title.trim() ? "is-done" : ""}>{title.trim() ? "Verket har fått navn" : "Gi verket et navn"}</span>
          <span className={step === 6 ? "is-done" : ""}>{step === 6 ? "Klar til gjennomgang" : "Forhåndsvis til slutt"}</span>
        </div>
        <p className="sell-live-footnote"><Sparkles /> En god presentasjon gjør det lettere for kjøperen å bli kjent med verket.</p>
      </aside>
      </div>
      {imageError&&step!==0&&<p role="alert" className="mt-3 text-sm text-destructive">{imageError}</p>}
      <Button variant="outline" className="sell-draft-button mt-4" disabled={publishing||!title.trim()||images.length===0} onClick={()=>void publish(true)}>Lagre utkast</Button>
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
