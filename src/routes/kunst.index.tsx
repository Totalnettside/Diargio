import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bookmark, ChevronDown, LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
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
    <main className="bg-background">
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-5 py-6">
          <nav className="text-xs text-ink/50"><Link to="/" className="hover:underline">Forsiden</Link> / <span className="text-ink">Kunst</span></nav>
          <h1 className="mt-2 font-display text-2xl font-semibold md:text-3xl">Kunst til salgs</h1>
          <form
            onSubmit={(e) => { e.preventDefault(); void navigate({ to: "/kunst", search: { q: query }, replace: true }); }}
            className="mt-4 flex gap-2"
          >
            <div className="flex flex-1 items-center gap-2 rounded-md border-2 border-border bg-background px-3 focus-within:border-brandink">
              <Search className="size-5 text-ink/40" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Søk etter kunstner, verk, stil…" className="w-full bg-transparent py-3 text-base outline-none" />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="Tøm søk"><X className="size-4 text-ink/50" /></button>}
            </div>
            <Button type="submit" className="h-auto rounded-md px-6">Søk</Button>
          </form>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-5 py-6">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className={`${openFilters ? "block" : "hidden"} lg:block`}>{filters}</aside>
          <div>
            <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
              <button
                onClick={() => setOpenFilters((v) => !v)}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold lg:hidden"
              >
                <SlidersHorizontal className="size-4" /> Filtre{activeFilterCount > 0 && ` (${activeFilterCount})`}
              </button>
              <p className="text-sm"><span className="font-bold">{results.length}</span> treff</p>
              <label className="relative ml-auto flex items-center gap-2 text-sm">
                <span className="text-ink/60">Sorter:</span>
                <select value={sort} onChange={(e) => setSort(e.target.value as (typeof sortOptions)[number])} className="appearance-none rounded-md border border-border bg-card py-2 pl-3 pr-8 text-sm outline-none">
                  {sortOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 size-4" />
              </label>
              <div className="flex overflow-hidden rounded-md border border-border">
                <button onClick={() => setView("grid")} aria-label="Rutenett" className={`grid size-9 place-items-center ${view === "grid" ? "bg-secondary" : "bg-card"}`}><LayoutGrid className="size-4" /></button>
                <button onClick={() => setView("list")} aria-label="Liste" className={`grid size-9 place-items-center ${view === "list" ? "bg-secondary" : "bg-card"}`}><List className="size-4" /></button>
              </div>
            </div>

            {results.length === 0 ? (
              <p className="mt-6 rounded-md border border-border bg-card p-8 text-sm text-ink/60">Ingen treff. Prøv å fjerne noen filtre.</p>
            ) : view === "grid" ? (
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
                {results.map((a) => <ArtworkCard key={a.id} artwork={a} />)}
              </div>
            ) : (
              <div className="mt-4 divide-y divide-border">
                {results.map((a) => (
                  <Link key={a.id} to="/kunst/$slug" params={{ slug: a.slug }} className="flex gap-4 py-4 hover:bg-secondary/40">
                    <img src={a.image} alt={a.title} loading="lazy" className="size-28 shrink-0 rounded-md object-cover md:size-36" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-ink/50">{a.location} · {a.createdDaysAgo === 0 ? "I dag" : `${a.createdDaysAgo} d siden`}</p>
                      <p className="mt-1 truncate font-display text-lg font-medium">{a.title}</p>
                      <p className="text-sm text-ink/60">{artistById(a.artistId)?.name} · {a.technique}</p>
                      <p className="mt-2 text-lg font-bold">{a.saleType === "Pris på forespørsel" ? "Pris på forespørsel" : formatPrice(a.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
