import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";
import { Link } from "@tanstack/react-router";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { artists, formatPrice } from "@/data/demo";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Adminpanel | Diargio" },
      { name: "description", content: "Administrer brukere, annonser, transaksjoner og moderering." },
      { property: "og:title", content: "Adminpanel | Diargio" },
      { property: "og:description", content: "Administrer Diargios markedsplass." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const sections = [
  "Dashboard",
  "Annonser",
  "Brukere",
  "Kunstnere",
  "Moderering",
  "Forretningsmodell",
] as const;

const reportReasons = [
  "Mistenkt falsk kunst",
  "Kopi/reproduksjon feilaktig markedsført",
  "Svindel",
  "Feil informasjon",
  "Stjålet kunst",
  "Upassende innhold",
  "Annet",
];

function AdminPage() {
  const { isAdmin, checking } = useIsAdmin();
  if (checking) return <main className="p-10 text-center text-sm text-ink/60">Laster…</main>;
  if (!isAdmin)
    return (
      <main className="mx-auto max-w-md p-10 text-center">
        <h1 className="font-display text-xl font-semibold">Ingen tilgang</h1>
        <p className="mt-2 text-sm text-ink/60">Adminpanelet er kun for administrator.</p>
        <Link to="/" className="mt-4 inline-block rounded-2xl bg-brandink px-5 py-2 text-sm font-semibold text-primary-foreground">Til forsiden</Link>
      </main>
    );
  return <AdminContent />;
}

function AdminContent() {
  const [section, setSection] = useState<(typeof sections)[number]>("Dashboard");
  const { allArtworks: artworks, deleteListing } = useStore();
  const [users, setUsers] = useState<{ id: string; display_name: string | null; first_name: string | null; last_name: string | null; avatar_url: string | null; location: string | null; created_at: string; bankid_verified: boolean }[]>([]);
  useEffect(() => {
    void supabase
      .from("profiles")
      .select("id,display_name,first_name,last_name,avatar_url,location,created_at,bankid_verified")
      .order("created_at", { ascending: false })
      .then(({ data }) => setUsers(data ?? []));
  }, []);
  const [commission, setCommission] = useState("20");
  const [proPrice, setProPrice] = useState("999");
  const [promos, setPromos] = useState({ fremhev: "99", topp: "149", forside: "299" });
  const gmv = artworks.reduce((s, a) => s + a.price, 0);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-5">
      <h1 className="font-display text-2xl font-semibold">Adminpanel</h1>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold glass ${
              section === s ? "bg-brandink text-primary-foreground" : "bg-white/60"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {section === "Dashboard" && (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {([
            ["Totale brukere", String(users.length), "Brukere"],
            ["Aktive annonser", String(artworks.length), "Annonser"],
            ["GMV", formatPrice(gmv)],
            ["Diargio-gebyr (20 %)", formatPrice(Math.round(gmv * 0.2))],
            ["Kunstavgift (5 %)", formatPrice(Math.round(gmv * 0.05))],
            ["Nye annonser (7d)", "42"],
            ["Antall handler", "138"],
            ["Snitt salgspris", formatPrice(artworks.length ? Math.round(gmv / artworks.length) : 0)],
            ["Tvister", "2"],
          ] as [string, string, ...string[]][]).map(([k, v, target]) => (
            <button
              key={k}
              onClick={() => target && setSection(target as (typeof sections)[number])}
              className={`rounded-2xl p-4 glass text-left ${target ? "cursor-pointer hover:ring-1 hover:ring-brandink/30" : "cursor-default"}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">{k}</p>
              <p className="text-lg font-bold">{v}</p>
            </button>
          ))}
        </div>
      )}

      {section === "Annonser" && (
        <div className="mt-4 overflow-x-auto rounded-3xl p-4 glass">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="py-2">Verk</th>
                <th>Selger</th>
                <th>Pris</th>
                <th>Salgsform</th>
                <th>Handling</th>
              </tr>
            </thead>
            <tbody>
              {artworks.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="py-2">{a.title}</td>
                  <td>{a.location}</td>
                  <td>{formatPrice(a.price)}</td>
                  <td>{a.saleType}</td>
                  <td>
                    <button
                      onClick={() => confirm(`Slette «${a.title}»?`) && deleteListing(a.id)}
                      className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold glass"
                    >
                      Slett
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section === "Brukere" && (
        <div className="mt-4 space-y-2">
          {users.length === 0 && <p className="text-sm text-ink/60">Ingen brukere ennå.</p>}
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-2xl p-3 glass">
              {u.avatar_url ? (
                <img src={u.avatar_url} alt="" className="size-10 rounded-full object-cover" />
              ) : (
                <div className="size-10 rounded-full bg-mint/60" />
              )}
              <div>
                <p className="text-sm font-semibold">
                  {[u.first_name, u.last_name].filter(Boolean).join(" ") || u.display_name || "Uten navn"}
                </p>
                <p className="text-xs text-ink/55">
                  {u.location ?? "Ukjent sted"} · Registrert {new Date(u.created_at).toLocaleDateString("nb-NO")}
                </p>
              </div>
              <span className="ml-auto rounded-full bg-mint/60 px-3 py-1 text-xs font-semibold text-brandink">
                {u.bankid_verified ? "Verifisert" : "Ikke verifisert"}
              </span>
            </div>
          ))}
        </div>
      )}

      {section === "Kunstnere" && (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {artists.map((a) => (
            <div key={a.id} className="rounded-2xl p-3 text-sm glass">
              <p className="font-semibold">{a.name}</p>
              <p className="text-xs text-ink/55">
                {a.nationality} · {a.movement}
              </p>
            </div>
          ))}
        </div>
      )}

      {section === "Moderering" && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-ink/60">Rapporterte annonser i kø: 3</p>
          {artworks.slice(0, 3).map((a, i) => (
            <div key={a.id} className="rounded-2xl p-4 glass">
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="text-xs text-ink/55">Årsak: {reportReasons[i]}</p>
              <div className="mt-2 flex gap-2">
                <button className="rounded-xl bg-mint/70 px-3 py-1.5 text-xs font-semibold text-brandink glass">
                  Godkjenn
                </button>
                <button className="rounded-xl bg-peach/70 px-3 py-1.5 text-xs font-semibold text-brandink glass">
                  Be om mer info
                </button>
                <button className="rounded-xl bg-white/70 px-3 py-1.5 text-xs font-semibold glass">
                  Fjern annonse
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {section === "Forretningsmodell" && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl p-4 glass">
            <p className="text-sm font-bold">Provisjon ved salg</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                value={commission}
                onChange={(e) => setCommission(e.target.value.replace(/\D/g, ""))}
                className="w-24 rounded-2xl bg-white/70 px-3 py-2 text-sm outline-none glass"
              />
              <span className="text-sm">% av salgssum</span>
            </div>
          </div>
          <div className="rounded-2xl p-4 glass">
            <p className="text-sm font-bold">Galleri Pro-abonnement</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                value={proPrice}
                onChange={(e) => setProPrice(e.target.value.replace(/\D/g, ""))}
                className="w-28 rounded-2xl bg-white/70 px-3 py-2 text-sm outline-none glass"
              />
              <span className="text-sm">kr/mnd</span>
            </div>
            <p className="mt-2 text-xs text-ink/55">
              Mange annonser, galleriprofil, analytics, verifisert badge, bulk upload, prioriterte
              annonser.
            </p>
          </div>
          <div className="rounded-2xl p-4 glass md:col-span-2">
            <p className="text-sm font-bold">Promotering</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {(
                [
                  ["Fremhev annonse", "fremhev"],
                  ["Topplassering", "topp"],
                  ["Forsiden", "forside"],
                ] as const
              ).map(([label, key]) => (
                <label key={key} className="text-xs font-semibold">
                  {label}
                  <input
                    value={promos[key]}
                    onChange={(e) =>
                      setPromos({ ...promos, [key]: e.target.value.replace(/\D/g, "") })
                    }
                    className="mt-1 w-full rounded-2xl bg-white/70 px-3 py-2 text-sm outline-none glass"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
