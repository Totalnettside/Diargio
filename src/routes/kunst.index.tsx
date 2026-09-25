import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bookmark, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  artTypes,
  artistById,
  categories,
  conditions,
  counties,
  saleTypes,
  sellerById,
  sellerTypes,
  styles,
  techniques,
} from "@/data/demo";
import { useStore } from "@/lib/store";

type KunstSearch = {
  kategori?: string;
  q?: string;
};

export const Route = createFileRoute("/kunst/")({
  validateSearch: (search: Record<string, unknown>): KunstSearch => ({
    ...(typeof search["kategori"] === "string" ? { kategori: search["kategori"] } : {}),
    ...(typeof search["q"] === "string" ? { q: search["q"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Kunst til salgs i Norge | Diargio" },
      {
        name: "description",
        content:
          "Bla gjennom malerier, grafikk, fotografi, skulpturer og street art til salgs fra kunstnere, gallerier og private selgere.",
      },
      { property: "og:title", content: "Kunst til salgs | Diargio" },
      {
        property: "og:description",
        content: "Filtrer på kategori, pris, stil, teknikk, selgertype og salgsform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Marketplace,
});

const sortOptions = [
  "Mest relevant",
  "Nyeste",
  "Pris lav–høy",
  "Pris høy–lav",
  "Mest populære",
  "Mest sett",
] as const;

function OptionList({ options, selected, onToggle }: { options: readonly string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="grid gap-1">
      {options.map((option) => (
        <label key={option} className="flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 text-sm hover:bg-secondary/60">
          <Checkbox checked={selected.includes(option)} onCheckedChange={() => onToggle(option)} />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}

function FilterTitle({ label, count }: { label: string; count: number }) {
  return (
    <span className="flex items-center gap-2">
      {label}
      {count > 0 && <span className="rounded-full bg-brandink px-2 py-0.5 text-[10px] font-bold text-primary-foreground">{count}</span>}
    </span>
  );
}

function Marketplace() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { allArtworks, saveSearch } = useStore();

  const [kategori, setKategori] = useState<string[]>(search.kategori ? [search.kategori] : []);
  const [stil, setStil] = useState<string[]>([]);
  const [teknikk, setTeknikk] = useState<string[]>([]);
  const [type, setType] = useState<string[]>([]);
  const [tilstand, setTilstand] = useState<string[]>([]);
  const [selgertype, setSelgertype] = useState<string[]>([]);
  const [salgsform, setSalgsform] = useState<string[]>([]);
  const [fylke, setFylke] = useState<string[]>([]);
  const [fra, setFra] = useState("");
  const [til, setTil] = useState("");
  const [kunstnerSok, setKunstnerSok] = useState("");
  const [minBredde, setMinBredde] = useState("");
  const [minHoyde, setMinHoyde] = useState("");
  const [sort, setSort] = useState<(typeof sortOptions)[number]>("Mest relevant");
  const [query, setQuery] = useState(search.q ?? "");
  const [openFilters, setOpenFilters] = useState(false);

  const toggle = (list: string[], set: (v: string[]) => void) => (v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const activeFilterCount = kategori.length + stil.length + teknikk.length + type.length + tilstand.length + selgertype.length + salgsform.length + fylke.length + Number(Boolean(fra || til)) + Number(Boolean(kunstnerSok)) + Number(Boolean(minBredde || minHoyde));

  const clearFilters = () => {
    setKategori([]); setStil([]); setTeknikk([]); setType([]); setTilstand([]);
    setSelgertype([]); setSalgsform([]); setFylke([]); setFra(""); setTil("");
    setKunstnerSok(""); setMinBredde(""); setMinHoyde("");
  };

  const results = useMemo(() => {
    let out = allArtworks.filter((a) => {
      const artist = artistById(a.artistId);
      const seller = sellerById(a.sellerId);
      if (kategori.length && !kategori.includes(a.category)) return false;
      if (stil.length && !stil.includes(a.style)) return false;
      if (teknikk.length && !teknikk.includes(a.technique)) return false;
      if (type.length && !type.includes(a.type)) return false;
      if (tilstand.length && !tilstand.includes(a.condition)) return false;
      if (selgertype.length && !selgertype.includes(seller.type)) return false;
      if (salgsform.length && !salgsform.includes(a.saleType)) return false;
      if (fylke.length && !fylke.includes(a.county)) return false;
      if (fra && a.price < Number(fra)) return false;
      if (til && a.price > Number(til)) return false;
      if (minBredde && a.widthCm < Number(minBredde)) return false;
      if (minHoyde && a.heightCm < Number(minHoyde)) return false;
      if (kunstnerSok && !artist.name.toLowerCase().includes(kunstnerSok.toLowerCase())) return false;
      if (query) {
        const hay = `${a.title} ${artist.name} ${a.category} ${a.style} ${a.technique}`.toLowerCase();
        if (!hay.includes(query.toLowerCase())) return false;
      }
      return true;
    });
    out = [...out];
    if (sort === "Nyeste") out.sort((a, b) => a.createdDaysAgo - b.createdDaysAgo);
    if (sort === "Pris lav–høy") out.sort((a, b) => a.price - b.price);
    if (sort === "Pris høy–lav") out.sort((a, b) => b.price - a.price);
    if (sort === "Mest populære") out.sort((a, b) => b.favorites - a.favorites);
    if (sort === "Mest sett") out.sort((a, b) => b.views - a.views);
    return out;
  }, [
    allArtworks,
    kategori,
    stil,
    teknikk,
    type,
    tilstand,
    selgertype,
    salgsform,
    fylke,
    fra,
    til,
    minBredde,
    minHoyde,
    kunstnerSok,
    query,
    sort,
  ]);

  const featured = results[0];

  const filters = (
    <div className="border-t border-border py-5 lg:sticky lg:top-20 lg:border-t-0 lg:py-0">
      <div className="flex items-center justify-between">
        <p className="font-display text-base font-semibold">Filtrer samlingen</p>
        <button onClick={() => setOpenFilters(false)} className="grid size-9 place-items-center lg:hidden" aria-label="Lukk filtre">
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/50">Søk</p>
        <div className="mt-2 flex items-center gap-2 border-b border-border py-2">
          <Search className="size-4 text-ink/40" />
          <input value={query} onChange={(e) => { setQuery(e.target.value); void navigate({ to: "/kunst", search: { q: e.target.value }, replace: true }); }} placeholder="Verk, stil eller kategori" className="w-full bg-transparent text-sm outline-none" />
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["kategori", "pris"]} className="mt-3 border-t border-border">
        <AccordionItem value="kategori">
          <AccordionTrigger className="hover:no-underline"><FilterTitle label="Kategori" count={kategori.length} /></AccordionTrigger>
          <AccordionContent><OptionList options={categories} selected={kategori} onToggle={toggle(kategori, setKategori)} /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="pris">
          <AccordionTrigger className="hover:no-underline"><FilterTitle label="Pris" count={Number(Boolean(fra || til))} /></AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-3">
              <input value={fra} onChange={(e) => setFra(e.target.value.replace(/\D/g, ""))} placeholder="Fra kr" inputMode="numeric" className="min-w-0 border-b border-border bg-transparent px-1 py-2 text-sm outline-none" />
              <input value={til} onChange={(e) => setTil(e.target.value.replace(/\D/g, ""))} placeholder="Til kr" inputMode="numeric" className="min-w-0 border-b border-border bg-transparent px-1 py-2 text-sm outline-none" />
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="uttrykk">
          <AccordionTrigger className="hover:no-underline"><FilterTitle label="Stil og uttrykk" count={stil.length + teknikk.length + type.length} /></AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink/50">Stil</p><OptionList options={styles} selected={stil} onToggle={toggle(stil, setStil)} /></div>
            <div className="border-t border-border pt-4"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink/50">Teknikk</p><OptionList options={techniques} selected={teknikk} onToggle={toggle(teknikk, setTeknikk)} /></div>
            <div className="border-t border-border pt-4"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink/50">Type</p><OptionList options={artTypes} selected={type} onToggle={toggle(type, setType)} /></div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="kunstner">
          <AccordionTrigger className="hover:no-underline"><FilterTitle label="Kunstner og selger" count={selgertype.length + Number(Boolean(kunstnerSok))} /></AccordionTrigger>
          <AccordionContent className="space-y-4">
            <input value={kunstnerSok} onChange={(e) => setKunstnerSok(e.target.value)} placeholder="Søk etter kunstner" className="w-full border-b border-border bg-transparent px-1 py-2 text-sm outline-none" />
            <OptionList options={sellerTypes} selected={selgertype} onToggle={toggle(selgertype, setSelgertype)} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="sted">
          <AccordionTrigger className="hover:no-underline"><FilterTitle label="Sted" count={fylke.length} /></AccordionTrigger>
          <AccordionContent><OptionList options={counties} selected={fylke} onToggle={toggle(fylke, setFylke)} /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="detaljer">
          <AccordionTrigger className="hover:no-underline"><FilterTitle label="Flere valg" count={salgsform.length + tilstand.length + Number(Boolean(minBredde || minHoyde))} /></AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink/50">Salgsform</p><OptionList options={saleTypes} selected={salgsform} onToggle={toggle(salgsform, setSalgsform)} /></div>
            <div className="border-t border-border pt-4"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink/50">Tilstand</p><OptionList options={conditions} selected={tilstand} onToggle={toggle(tilstand, setTilstand)} /></div>
            <div className="border-t border-border pt-4"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink/50">Minimum størrelse</p><div className="grid grid-cols-2 gap-3"><input value={minBredde} onChange={(e) => setMinBredde(e.target.value.replace(/\D/g, ""))} placeholder="Bredde cm" inputMode="numeric" className="min-w-0 border-b border-border bg-transparent px-1 py-2 text-sm outline-none" /><input value={minHoyde} onChange={(e) => setMinHoyde(e.target.value.replace(/\D/g, ""))} placeholder="Høyde cm" inputMode="numeric" className="min-w-0 border-b border-border bg-transparent px-1 py-2 text-sm outline-none" /></div></div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {activeFilterCount > 0 && <Button variant="ghost" onClick={clearFilters} className="mt-3 w-full text-ink/60">Nullstill {activeFilterCount} valg</Button>}

      <Button
        onClick={() => saveSearch(query, query || kategori.join(", ") || "Alle verk")}
        className="mt-3 w-full rounded-sm py-3"
      >
        <Bookmark className="size-4" /> Lagre søk
      </Button>
    </div>
  );

  return (
    <main>
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1fr_auto] md:items-end md:py-16">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brandink">Den norske kunstsamlingen</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-6xl">Kunst som fortjener en plass hos deg.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/60 md:text-base">Oppdag originale verk fra etablerte kunstnere, nye stemmer, gallerier og private samlinger over hele Norge.</p>
          </div>
          <div className="border-l border-border pl-5">
            <p className="font-display text-3xl font-semibold">{results.length}</p>
            <p className="text-xs text-ink/50">tilgjengelige verk</p>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-5 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
        <button
          onClick={() => setOpenFilters((v) => !v)}
          className="flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-2.5 text-sm font-semibold text-brandink lg:hidden"
        >
          <SlidersHorizontal className="size-4" /> {openFilters ? "Skjul filtre" : "Filtre"}
        </button>
        <p className="hidden text-xs text-ink/50 lg:block">Kuratert utvalg · Oppdatert fortløpende</p>
        <label className="relative ml-auto flex items-center gap-2 text-xs font-semibold">
          Sorter
          <select value={sort} onChange={(e) => setSort(e.target.value as (typeof sortOptions)[number])} className="appearance-none border-b border-border bg-transparent py-2 pl-2 pr-7 text-sm outline-none">
            {sortOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-0 size-4" />
        </label>
      </div>

      <div className="mt-7 grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside className={`${openFilters ? "block" : "hidden"} lg:block lg:border-r lg:border-border lg:pr-7`}>{filters}</aside>
        <div>
          {results.length === 0 ? (
            <p className="border border-border bg-card p-8 text-sm text-ink/60">
              Ingen verk matcher filtrene. Prøv å fjerne noen valg.
            </p>
          ) : featured ? (
            <>
              <div className="mb-10 grid gap-5 border-b border-border pb-10 md:grid-cols-[1.35fr_1fr] md:items-center">
                <ArtworkCard artwork={featured} large />
                <div className="px-1 md:px-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brandink">Redaksjonelt utvalgt</p>
                  <h2 className="mt-3 font-display text-2xl font-semibold md:text-3xl">Et verk å leve med</h2>
                  <p className="mt-3 text-sm leading-7 text-ink/60">Et fremhevet verk fra dagens samling, valgt for sitt særpreg, håndverk og evne til å forme et rom.</p>
                  <Link to="/kunst/$slug" params={{ slug: featured.slug }} className="mt-5 inline-block border-b border-brandink pb-1 text-sm font-semibold text-brandink">Se hele verket</Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3">
                {results.slice(1).map((a) => <ArtworkCard key={a.id} artwork={a} />)}
              </div>
            </>
          ) : null}
        </div>
      </div>
      </div>
    </main>
  );
}
