import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminOverview, setAdminRole, setVerified } from "@/lib/admin.functions";
import { adminDeleteUser } from "@/lib/account.functions";
import { useStore } from "@/lib/store";
import { breakdownFromTotal } from "@/lib/fees";
const feeShare = (t: number) => { const b = breakdownFromTotal(t); return t ? (b.platformFee + b.artFee) / t : 0; };
const TOTAL_FEE_RATE = feeShare(10000);
const PLATFORM_FEE_RATE = breakdownFromTotal(10000).platformFee / 10000;
const ART_FEE_RATE = breakdownFromTotal(10000).artFee / 10000;

const tabs = ["Oversikt", "Brukere", "Annonser", "Bud & salg", "Toppliste", "Økonomi"] as const;
type Tab = (typeof tabs)[number];
const kr = (n: number) => new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(n);
const day = 86400000;
const ago = (iso: string | null) => {
  if (!iso) return "aldri";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m} min siden`;
  if (m < 1440) return `${Math.round(m / 60)} t siden`;
  return `${Math.round(m / 1440)} d siden`;
};

export function ControlCenter() {
  const fetchOverview = useServerFn(getAdminOverview);
  const qc = useQueryClient();
  const { data, isLoading, error, refetch, isFetching } = useQuery({ queryKey: ["admin-overview"], queryFn: () => fetchOverview(), refetchInterval: 30000 });
  const [tab, setTab] = useState<Tab>("Oversikt");

  if (isLoading) return <main className="p-10 text-center text-sm text-muted-foreground">Laster kontrollsenteret…</main>;
  if (error || !data) return <main className="p-10 text-center text-sm text-destructive">Kunne ikke laste data.</main>;
  const reload = () => qc.invalidateQueries({ queryKey: ["admin-overview"] });

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Diargio</p>
          <h1 className="font-display text-3xl font-semibold">Kontrollsenter</h1>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold">
          <span className={`size-2 rounded-full bg-sage ${isFetching ? "animate-ping" : "animate-pulse"}`} />
          Live · oppdateres hvert 30. sek
        </button>
      </div>
      <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${tab === t ? "bg-sage text-primary-foreground shadow" : "border border-border bg-card hover:bg-muted"}`}>
            {t}
          </button>
        ))}
      </nav>
      <div className="mt-5">
        {tab === "Oversikt" && <Overview d={data} go={setTab} />}
        {tab === "Brukere" && <Users d={data} reload={reload} />}
        {tab === "Annonser" && <Listings d={data} reload={reload} />}
        {tab === "Bud & salg" && <Deals d={data} />}
        {tab === "Toppliste" && <Leaderboard d={data} />}
        {tab === "Økonomi" && <Economy d={data} />}
      </div>
    </main>
  );
}

type D = Awaited<ReturnType<typeof getAdminOverview>>;
const card = "rounded-2xl border border-border bg-card p-4 shadow-sm";
const nameOf = (d: D, id: string) => {
  const u = d.users.find((x) => x.id === id);
  return u ? [u.first_name, u.last_name].filter(Boolean).join(" ") || u.display_name || u.email || "Uten navn" : "Slettet bruker";
};
const priceOf = (d: D, lid: string) => d.listings.find((l) => l.id === lid)?.price ?? 0;
const titleOf = (d: D, lid: string) => d.listings.find((l) => l.id === lid)?.title ?? "Fjernet annonse";

function Kpi({ label, value, sub, onClick }: { label: string; value: string; sub?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`${card} text-left transition ${onClick ? "hover:-translate-y-0.5 hover:shadow-md" : "cursor-default"}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-sage">{sub}</p>}
    </button>
  );
}

function Bars({ series, label }: { series: number[]; label: string }) {
  const max = Math.max(1, ...series);
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <div className="mt-2 flex h-24 items-end gap-1">
        {series.map((v, i) => (
          <div key={i} title={`${v}`} className="flex-1 rounded-t bg-sage/80 transition-all hover:bg-sage" style={{ height: `${Math.max(4, (v / max) * 100)}%` }} />
        ))}
      </div>
      <p className="mt-1 flex justify-between text-[10px] text-muted-foreground"><span>14 d siden</span><span>i dag</span></p>
    </div>
  );
}
const series14 = (dates: string[]) => {
  const out = Array(14).fill(0) as number[];
  const start = new Date().setHours(0, 0, 0, 0) - 13 * day;
  dates.forEach((t) => {
    const i = Math.floor((new Date(t).getTime() - start) / day);
    if (i >= 0 && i < 14) out[i] = (out[i] ?? 0) + 1;
  });
  return out;
};
const within = (dates: string[], ms: number) => dates.filter((t) => Date.now() - new Date(t).getTime() < ms).length;

function Overview({ d, go }: { d: D; go: (t: Tab) => void }) {
  const gmv = d.purchases.reduce((s, p) => s + priceOf(d, p.listing_id), 0);
  const pending = d.bids.filter((b) => b.status === "pending");
  const notOnboarded = d.users.filter((u) => !u.onboarded);
  const noImage = d.listings.filter((l) => !l.image);
  const staleBids = pending.filter((b) => Date.now() - new Date(b.created_at).getTime() > 2 * day);
  const activeToday = d.users.filter((u) => u.last_sign_in_at && Date.now() - new Date(u.last_sign_in_at).getTime() < day).length;

  const feed = [
    ...d.users.map((u) => ({ t: u.created_at, icon: "👤", text: `${nameOf(d, u.id)} ble medlem` })),
    ...d.listings.map((l) => ({ t: l.created_at, icon: "🖼️", text: `${nameOf(d, l.user_id)} la ut «${l.title}»` })),
    ...d.bids.map((b) => ({ t: b.created_at, icon: "💬", text: `${nameOf(d, b.buyer_id)} bød ${kr(Number(b.amount))} på «${titleOf(d, b.listing_id)}»` })),
    ...d.purchases.map((p) => ({ t: p.created_at, icon: "💰", text: `${nameOf(d, p.buyer_id)} kjøpte «${titleOf(d, p.listing_id)}»` })),
    ...d.follows.map((f) => ({ t: f.created_at, icon: "⭐", text: `Ny følger på ${nameOf(d, f.artist_id)}` })),
  ].sort((a, b) => b.t.localeCompare(a.t)).slice(0, 15);

  const alerts = [
    staleBids.length && { text: `${staleBids.length} bud har ventet over 48 timer uten svar`, tab: "Bud & salg" as Tab },
    notOnboarded.length && { text: `${notOnboarded.length} brukere har ikke fullført profilen`, tab: "Brukere" as Tab },
    noImage.length && { text: `${noImage.length} annonser mangler bilde`, tab: "Annonser" as Tab },
  ].filter(Boolean) as { text: string; tab: Tab }[];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Brukere" value={String(d.users.length)} sub={`+${within(d.users.map((u) => u.created_at), 7 * day)} siste 7 d`} onClick={() => go("Brukere")} />
        <Kpi label="Aktive i dag" value={String(activeToday)} sub="logget inn siste 24 t" onClick={() => go("Brukere")} />
        <Kpi label="Annonser" value={String(d.listings.length)} sub={`+${within(d.listings.map((l) => l.created_at), 7 * day)} siste 7 d`} onClick={() => go("Annonser")} />
        <Kpi label="Ventende bud" value={String(pending.length)} sub={`${d.bids.length} bud totalt`} onClick={() => go("Bud & salg")} />
        <Kpi label="Salg" value={String(d.purchases.length)} sub={kr(gmv) + " omsatt"} onClick={() => go("Økonomi")} />
        <Kpi label="Diargio inntekt" value={kr(gmv * TOTAL_FEE_RATE)} sub="provisjon + kunstavgift" onClick={() => go("Økonomi")} />
        <Kpi label="Meldinger 24 t" value={String(within(d.messageTimes, day))} sub={`${d.messageTimes.length} totalt`} />
        <Kpi label="Følgerskap" value={String(d.follows.length)} sub={`${d.reviews.length} omtaler`} onClick={() => go("Toppliste")} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`${card} lg:col-span-2 grid gap-6 sm:grid-cols-3`}>
          <Bars label="Nye brukere" series={series14(d.users.map((u) => u.created_at))} />
          <Bars label="Nye annonser" series={series14(d.listings.map((l) => l.created_at))} />
          <Bars label="Bud" series={series14(d.bids.map((b) => b.created_at))} />
        </div>
        <div className={card}>
          <p className="text-sm font-bold">Trenger oppmerksomhet</p>
          {alerts.length === 0 ? (
            <p className="mt-3 text-sm text-sage">✓ Alt ser bra ut</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {alerts.map((a) => (
                <li key={a.text}>
                  <button onClick={() => go(a.tab)} className="w-full rounded-xl bg-muted px-3 py-2 text-left text-sm hover:bg-sagelight">⚠️ {a.text}</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={card}>
        <p className="text-sm font-bold">Siste aktivitet</p>
        {feed.length === 0 && <p className="mt-2 text-sm text-muted-foreground">Ingen aktivitet ennå.</p>}
        <ul className="mt-3 divide-y divide-border">
          {feed.map((f, i) => (
            <li key={i} className="flex items-center gap-3 py-2 text-sm">
              <span>{f.icon}</span>
              <span className="flex-1">{f.text}</span>
              <span className="text-xs text-muted-foreground">{ago(f.t)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Users({ d, reload }: { d: D; reload: () => void }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"alle" | "admin" | "selgere" | "ufullstendig">("alle");
  const del = useServerFn(adminDeleteUser);
  const role = useServerFn(setAdminRole);
  const verify = useServerFn(setVerified);
  const sellers = new Set(d.listings.map((l) => l.user_id));
  const rows = d.users
    .filter((u) => (filter === "admin" ? d.adminIds.includes(u.id) : filter === "selgere" ? sellers.has(u.id) : filter === "ufullstendig" ? !u.onboarded : true))
    .filter((u) => `${nameOf(d, u.id)} ${u.email ?? ""} ${u.location ?? ""} ${u.phone ?? ""}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const run = async (fn: () => Promise<unknown>) => {
    try { await fn(); reload(); } catch (e) { alert((e as Error).message); }
  };
  const exportCsv = () => {
    const lines = [["Navn", "E-post", "Telefon", "Sted", "Registrert", "Sist innlogget"].join(";"), ...rows.map((u) => [nameOf(d, u.id), u.email ?? "", u.phone ?? "", u.location ?? "", u.created_at.slice(0, 10), u.last_sign_in_at?.slice(0, 10) ?? ""].join(";"))];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv" }));
    a.download = "diargio-brukere.csv";
    a.click();
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Søk navn, e-post, sted, telefon…" className="min-w-60 flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-sage" />
        {(["alle", "admin", "selgere", "ufullstendig"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-2 text-xs font-semibold capitalize ${filter === f ? "bg-sage text-primary-foreground" : "border border-border bg-card"}`}>{f}</button>
        ))}
        <button onClick={exportCsv} className="rounded-full border border-sage px-3 py-2 text-xs font-semibold text-sage hover:bg-sage hover:text-primary-foreground">Eksporter CSV</button>
      </div>
      <p className="text-xs text-muted-foreground">{rows.length} brukere</p>
      {rows.map((u) => {
        const isAdmin = d.adminIds.includes(u.id);
        const nListings = d.listings.filter((l) => l.user_id === u.id).length;
        return (
          <div key={u.id} className={`${card} flex flex-wrap items-center gap-3`}>
            {u.avatar_url ? <img src={u.avatar_url} alt="" className="size-11 rounded-full object-cover" /> : <div className="grid size-11 place-items-center rounded-full bg-sagelight font-semibold">{nameOf(d, u.id)[0]}</div>}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold">
                {nameOf(d, u.id)}
                {isAdmin && <span className="rounded-full bg-sage px-2 py-0.5 text-[10px] text-primary-foreground">ADMIN</span>}
                {u.bankid_verified && <span className="text-sage" title="Verifisert">✓</span>}
              </p>
              <p className="truncate text-xs text-muted-foreground">{u.email ?? "–"} · {u.phone ?? "ingen tlf"} · {u.location ?? "ukjent sted"}</p>
              <p className="text-xs text-muted-foreground">Ble med {new Date(u.created_at).toLocaleDateString("nb-NO")} · sist inne {ago(u.last_sign_in_at)} · via {u.provider} · {nListings} annonser</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Link to="/selger/$id" params={{ id: u.id }} className="rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-muted">Profil</Link>
              {u.email && <a href={`mailto:${u.email}`} className="rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-muted">E-post</a>}
              <button disabled={!u.bankid_verified} onClick={() => run(() => verify({ data: { userId: u.id, verified: false } }))} className="rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-muted">{u.bankid_verified ? "Fjern verifisering" : "BankID kommer senere"}</button>
              <button onClick={() => confirm(isAdmin ? "Fjerne admin-tilgang?" : "Gi admin-tilgang?") && run(() => role({ data: { userId: u.id, admin: !isAdmin } }))} className="rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-muted">{isAdmin ? "Fjern admin" : "Gjør til admin"}</button>
              <button onClick={() => confirm("Slette brukeren og alt innholdet? Kan ikke angres.") && run(() => del({ data: { userId: u.id } }))} className="rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground">Slett</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Listings({ d, reload }: { d: D; reload: () => void }) {
  const { deleteListing } = useStore();
  const [q, setQ] = useState("");
  const sold = new Set(d.purchases.map((p) => p.listing_id));
  const rows = d.listings.filter((l) => `${l.title} ${nameOf(d, l.user_id)} ${l.category}`.toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.created_at.localeCompare(a.created_at));
  return (
    <div className="space-y-3">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Søk tittel, kunstner, kategori…" className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-sage" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((l) => {
          const nb = d.bids.filter((b) => b.listing_id === l.id);
          const top = Math.max(0, ...nb.map((b) => Number(b.amount)));
          return (
            <div key={l.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="relative aspect-[4/3] bg-muted">
                {l.image ? <img src={l.image} alt={l.title} className="size-full object-cover" /> : <p className="grid size-full place-items-center text-xs text-destructive">Mangler bilde</p>}
                {sold.has(l.id) && <span className="absolute left-2 top-2 rounded-full bg-sage px-2 py-0.5 text-[10px] font-bold text-primary-foreground">SOLGT</span>}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{l.title}</p>
                <p className="text-xs text-muted-foreground">{nameOf(d, l.user_id)} · {ago(l.created_at)}</p>
                <p className="mt-1 text-sm font-bold">{kr(l.price)}</p>
                <p className="text-xs text-muted-foreground">{nb.length} bud{top ? ` · høyeste ${kr(top)}` : ""}</p>
                <div className="mt-2 flex gap-1.5">
                  <Link to="/kunst/$slug" params={{ slug: l.slug }} className="rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-muted">Vis</Link>
                  <button onClick={async () => { if (confirm(`Slette «${l.title}»?`)) { await deleteListing(l.id); reload(); } }} className="rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground">Slett</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {rows.length === 0 && <p className="text-sm text-muted-foreground">Ingen annonser.</p>}
    </div>
  );
}

function Deals({ d }: { d: D }) {
  const by = (s: string) => d.bids.filter((b) => b.status === s).length;
  const funnel = [
    ["Annonser", d.listings.length],
    ["Fikk bud", new Set(d.bids.map((b) => b.listing_id)).size],
    ["Bud godkjent", new Set(d.bids.filter((b) => b.status === "accepted").map((b) => b.listing_id)).size],
    ["Solgt", d.purchases.length],
  ] as const;
  const max = Math.max(1, funnel[0][1]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Kpi label="Venter" value={String(by("pending"))} />
        <Kpi label="Godkjent" value={String(by("accepted"))} />
        <Kpi label="Avslått" value={String(by("rejected"))} />
      </div>
      <div className={card}>
        <p className="text-sm font-bold">Salgstrakt</p>
        <div className="mt-3 space-y-2">
          {funnel.map(([k, v]) => (
            <div key={k} className="flex items-center gap-3 text-sm">
              <span className="w-28 text-muted-foreground">{k}</span>
              <div className="h-6 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-sage transition-all" style={{ width: `${(v / max) * 100}%` }} /></div>
              <span className="w-8 text-right font-bold">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={card}>
        <p className="text-sm font-bold">Alle bud</p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground"><tr><th className="py-2">Verk</th><th>Kjøper</th><th>Selger</th><th>Bud</th><th>Status</th><th>Når</th></tr></thead>
            <tbody>
              {[...d.bids].sort((a, b) => b.created_at.localeCompare(a.created_at)).map((b) => (
                <tr key={b.id} className="border-t border-border">
                  <td className="py-2">{titleOf(d, b.listing_id)}</td>
                  <td>{nameOf(d, b.buyer_id)}</td>
                  <td>{nameOf(d, b.seller_id)}</td>
                  <td className="font-semibold">{kr(Number(b.amount))}</td>
                  <td><span className={`rounded-full px-2 py-0.5 text-xs ${b.status === "accepted" ? "bg-sage text-primary-foreground" : b.status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-muted"}`}>{b.status === "accepted" ? "Godkjent" : b.status === "rejected" ? "Avslått" : "Venter"}</span></td>
                  <td className="text-xs text-muted-foreground">{ago(b.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {d.bids.length === 0 && <p className="py-3 text-sm text-muted-foreground">Ingen bud ennå.</p>}
        </div>
      </div>
    </div>
  );
}

function Leaderboard({ d }: { d: D }) {
  const rows = useMemo(() => {
    const ids = new Set([...d.listings.map((l) => l.user_id), ...d.follows.map((f) => f.artist_id)]);
    return [...ids].map((id) => {
      const rv = d.reviews.filter((r) => r.seller_id === id);
      const listings = d.listings.filter((l) => l.user_id === id).length;
      const followers = d.follows.filter((f) => f.artist_id === id).length;
      const bids = d.bids.filter((b) => b.seller_id === id).length;
      const sales = d.purchases.filter((p) => p.seller_id === id).length;
      const rating = rv.length ? rv.reduce((s, r) => s + r.rating, 0) / rv.length : 0;
      return { id, listings, followers, bids, sales, rating, score: sales * 10 + bids * 3 + followers * 2 + listings };
    }).sort((a, b) => b.score - a.score);
  }, [d]);
  return (
    <div className={card}>
      <p className="text-sm font-bold">Mest populære kunstnere</p>
      <p className="text-xs text-muted-foreground">Poeng: salg ×10, bud ×3, følgere ×2, annonser ×1</p>
      <ol className="mt-3 divide-y divide-border">
        {rows.map((r, i) => (
          <li key={r.id} className="flex items-center gap-3 py-2 text-sm">
            <span className={`grid size-7 place-items-center rounded-full text-xs font-bold ${i < 3 ? "bg-sage text-primary-foreground" : "bg-muted"}`}>{i + 1}</span>
            <Link to="/selger/$id" params={{ id: r.id }} className="flex-1 font-semibold hover:underline">{nameOf(d, r.id)}</Link>
            <span className="text-xs text-muted-foreground">{r.listings} verk · {r.followers} følgere · {r.bids} bud · {r.sales} salg{r.rating ? ` · ★ ${r.rating.toFixed(1)}` : ""}</span>
          </li>
        ))}
      </ol>
      {rows.length === 0 && <p className="text-sm text-muted-foreground">Ingen kunstnere ennå.</p>}
    </div>
  );
}

function Economy({ d }: { d: D }) {
  const gmv = d.purchases.reduce((s, p) => s + priceOf(d, p.listing_id), 0);
  const pipeline = d.bids.filter((b) => b.status === "accepted").reduce((s, b) => s + Number(b.amount), 0);
  const inventory = d.listings.reduce((s, l) => s + l.price, 0);
  const [sim, setSim] = useState(10);
  const avg = d.listings.length ? inventory / d.listings.length : 0;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Omsatt (salg)" value={kr(gmv)} />
        <Kpi label="Provisjon" value={kr(gmv * PLATFORM_FEE_RATE)} />
        <Kpi label="Kunstavgift" value={kr(gmv * ART_FEE_RATE)} />
        <Kpi label="Total inntekt" value={kr(gmv * TOTAL_FEE_RATE)} />
        <Kpi label="Godkjente bud (ubetalt)" value={kr(pipeline)} sub={`${kr(pipeline * TOTAL_FEE_RATE)} i mulig inntekt`} />
        <Kpi label="Verdi på alle annonser" value={kr(inventory)} sub={`${kr(inventory * TOTAL_FEE_RATE)} om alt selges`} />
        <Kpi label="Snittpris" value={kr(avg)} />
        <Kpi label="Salgsrate" value={`${d.listings.length ? Math.round((d.purchases.length / d.listings.length) * 100) : 0} %`} />
      </div>
      <div className={card}>
        <p className="text-sm font-bold">Inntektskalkulator</p>
        <p className="text-xs text-muted-foreground">Hvis vi selger så mange verk i måneden til dagens snittpris:</p>
        <input type="range" min={1} max={200} value={sim} onChange={(e) => setSim(Number(e.target.value))} className="mt-3 w-full accent-sage" />
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-sm">
          <span><b>{sim}</b> salg/mnd</span>
          <span>Månedlig: <b>{kr(sim * avg * TOTAL_FEE_RATE)}</b></span>
          <span>Årlig: <b className="text-sage">{kr(sim * avg * TOTAL_FEE_RATE * 12)}</b></span>
        </div>
      </div>
    </div>
  );
}
