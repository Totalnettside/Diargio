import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
      { title: "Kunst til salgs i Norge | Geargio" },
      {
        name: "description",
        content:
          "Bla gjennom malerier, grafikk, fotografi, skulpturer og street art til salgs fra kunstnere, gallerier og private selgere.",
      },
      { property: "og:title", content: "Kunst til salgs | Geargio" },
      {
        property: "og:description",
        content: "Filtrer på kategori, pris, stil, teknikk, selgertype og salgsform.",
      },
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
      className={`rounded-full px-3 py-1.5 text-xs font-semibold glass ${
        active ? "bg-lav text-brandink" : "bg-white/60"
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
      <p className="text-xs font-bold uppercase tracking-wide text-ink/50">{title}</p>
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
    <div className="rounded-3xl p-4 glass">
      <p className="font-display text-lg font-semibold">Filtrer</p>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-ink/50">Søk</p>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            void navigate({ to: "/kunst", search: { q: e.target.value }, replace: true });
          }}
          placeholder="Verk, stil eller kategori"
          className="mt-2 w-full rounded-2xl bg-white/70 px-3 py-2 text-sm outline-none glass"
        />
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
            className="w-full rounded-2xl bg-white/70 px-3 py-2 text-sm outline-none glass"
          />
          <input
            value={til}
            onChange={(e) => setTil(e.target.value.replace(/\D/g, ""))}
            placeholder="Til"
            inputMode="numeric"
            className="w-full rounded-2xl bg-white/70 px-3 py-2 text-sm outline-none glass"
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-ink/50">Kunstner</p>
        <input
          value={kunstnerSok}
          onChange={(e) => setKunstnerSok(e.target.value)}
          placeholder="Søk kunstner"
          className="mt-2 w-full rounded-2xl bg-white/70 px-3 py-2 text-sm outline-none glass"
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
            className="w-full rounded-2xl bg-white/70 px-3 py-2 text-sm outline-none glass"
          />
          <input
            value={minHoyde}
            onChange={(e) => setMinHoyde(e.target.value.replace(/\D/g, ""))}
            placeholder="Høyde"
            inputMode="numeric"
            className="w-full rounded-2xl bg-white/70 px-3 py-2 text-sm outline-none glass"
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
        className="mt-5 w-full rounded-2xl bg-brandink py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Lagre søk
      </button>
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-5">
      <h1 className="font-display text-2xl font-semibold">Kunst til salgs</h1>
      <p className="mt-1 text-sm text-ink/60">
        {results.length} verk fra kunstnere, gallerier og private selgere.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => setOpenFilters((v) => !v)}
          className="rounded-2xl bg-white/70 px-4 py-2 text-sm font-semibold text-brandink glass lg:hidden"
        >
          {openFilters ? "Skjul filtre" : "Filtre"}
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as (typeof sortOptions)[number])}
          className="rounded-2xl bg-white/70 px-3 py-2 text-sm font-semibold outline-none glass"
        >
          {sortOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className={`${openFilters ? "block" : "hidden"} lg:block`}>{filters}</aside>
        <div>
          {results.length === 0 ? (
            <p className="rounded-3xl p-6 text-sm text-ink/60 glass">
              Ingen verk matcher filtrene. Prøv å fjerne noen valg.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {results.map((a) => (
                <ArtworkCard key={a.id} artwork={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
