import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bookmark, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { ArtworkCard } from "@/components/ArtworkCard";
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

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-sm border px-3 py-2 text-xs font-semibold transition-colors ${
        active ? "border-brandink bg-brandink text-primary-foreground" : "border-border bg-card hover:border-brandink"
      }`}
    >
      {label}
    </button>
  );
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: readonly string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="mt-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/50">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o} label={o} active={selected.includes(o)} onClick={() => onToggle(o)} />
        ))}
      </div>
    </div>
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

      <FilterGroup
        title="Kategori"
        options={categories}
        selected={kategori}
        onToggle={toggle(kategori, setKategori)}
      />

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-ink/50">Pris</p>
        <div className="mt-2 flex gap-2">
          <input
            value={fra}
            onChange={(e) => setFra(e.target.value.replace(/\D/g, ""))}
            placeholder="Fra"
            inputMode="numeric"
            className="w-full border-b border-border bg-transparent px-1 py-2 text-sm outline-none"
          />
          <input
            value={til}
            onChange={(e) => setTil(e.target.value.replace(/\D/g, ""))}
            placeholder="Til"
            inputMode="numeric"
            className="w-full border-b border-border bg-transparent px-1 py-2 text-sm outline-none"
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-ink/50">Kunstner</p>
        <input
          value={kunstnerSok}
          onChange={(e) => setKunstnerSok(e.target.value)}
          placeholder="Søk kunstner"
          className="mt-2 w-full border-b border-border bg-transparent px-1 py-2 text-sm outline-none"
        />
      </div>

      <FilterGroup title="Type" options={artTypes} selected={type} onToggle={toggle(type, setType)} />
      <FilterGroup title="Stil" options={styles} selected={stil} onToggle={toggle(stil, setStil)} />
      <FilterGroup
        title="Teknikk"
        options={techniques}
        selected={teknikk}
        onToggle={toggle(teknikk, setTeknikk)}
      />

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-ink/50">Størrelse (min. cm)</p>
        <div className="mt-2 flex gap-2">
          <input
            value={minBredde}
            onChange={(e) => setMinBredde(e.target.value.replace(/\D/g, ""))}
            placeholder="Bredde"
            inputMode="numeric"
            className="w-full border-b border-border bg-transparent px-1 py-2 text-sm outline-none"
          />
          <input
            value={minHoyde}
            onChange={(e) => setMinHoyde(e.target.value.replace(/\D/g, ""))}
            placeholder="Høyde"
            inputMode="numeric"
            className="w-full border-b border-border bg-transparent px-1 py-2 text-sm outline-none"
          />
        </div>
      </div>

      <FilterGroup
        title="Selgertype"
        options={sellerTypes}
        selected={selgertype}
        onToggle={toggle(selgertype, setSelgertype)}
      />
      <FilterGroup
        title="Lokasjon"
        options={counties}
        selected={fylke}
        onToggle={toggle(fylke, setFylke)}
      />
      <FilterGroup
        title="Salgsform"
        options={saleTypes}
        selected={salgsform}
        onToggle={toggle(salgsform, setSalgsform)}
      />
      <FilterGroup
        title="Tilstand"
        options={conditions}
        selected={tilstand}
        onToggle={toggle(tilstand, setTilstand)}
      />

      <button
        onClick={() => saveSearch(query, query || kategori.join(", ") || "Alle verk")}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-brandink py-3 text-sm font-semibold text-primary-foreground"
      >
        <Bookmark className="size-4" /> Lagre søk
      </button>
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
          ) : (
            <>
              <div className="mb-10 grid gap-5 border-b border-border pb-10 md:grid-cols-[1.35fr_1fr] md:items-center">
                <ArtworkCard artwork={results[0]} large />
                <div className="px-1 md:px-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brandink">Redaksjonelt utvalgt</p>
                  <h2 className="mt-3 font-display text-2xl font-semibold md:text-3xl">Et verk å leve med</h2>
                  <p className="mt-3 text-sm leading-7 text-ink/60">Et fremhevet verk fra dagens samling, valgt for sitt særpreg, håndverk og evne til å forme et rom.</p>
                  <Link to="/kunst/$slug" params={{ slug: results[0].slug }} className="mt-5 inline-block border-b border-brandink pb-1 text-sm font-semibold text-brandink">Se hele verket</Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3">
                {results.slice(1).map((a) => <ArtworkCard key={a.id} artwork={a} />)}
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </main>
  );
}
