import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArtworkCard } from "@/components/ArtworkCard";
import { artists, formatPrice, reviews, sellers } from "@/data/demo";
import { useStore } from "@/lib/store";
import { ProfileForm } from "@/components/ProfileForm";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { UnreadBadge } from "@/components/UnreadBadge";

export const Route = createFileRoute("/min-side")({
  head: () => ({
    meta: [
      { title: "Min kunsthandel | Diargio" },
      {
        name: "description",
        content: "Oversikt over annonser, bud, favoritter, lagrede søk, salg og statistikk.",
      },
      { property: "og:title", content: "Min kunsthandel | Diargio" },
      { property: "og:description", content: "Dashboard for kjøp og salg av kunst." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const tabs = [
  "Oversikt",
  "Min profil",
  "Mine annonser",
  "Favoritter",
  "Lagrede søk",
  "Bud",
  "Følger",
  "Statistikk",
  "Vurderinger",
] as const;

function Dashboard() {
  const {
    myListings,
    favorites,
    allArtworks,
    savedSearches,
    bids,
    followedArtists,
    followedSellers,
    collections,
    markBidRead,
    decideBid,
    deleteListing,
  } = useStore();
  const { isAdmin } = useIsAdmin();
  const { user } = useAuth();
  const { conversations } = useChat();
  const receivedBids = bids.filter((b) => b.sellerId === user?.id);
  const sentBids = bids.filter((b) => b.buyerId === user?.id);
  const unreadBids = receivedBids.filter((b) => !b.read).length;
  const [tab, setTab] = useState<(typeof tabs)[number]>("Oversikt");
  const [decidingBid, setDecidingBid] = useState<string | null>(null);
  const [bidError, setBidError] = useState("");
  const handleDecision = async (id: string, decision: "accepted" | "rejected") => {
    if (!window.confirm(decision === "accepted" ? "Godkjenne dette budet? Betaling er ikke gjennomført." : "Avslå dette budet?")) return;
    setDecidingBid(id);
    setBidError("");
    try { await decideBid(id, decision); }
    catch (error) { setBidError(error instanceof Error ? error.message : "Kunne ikke behandle budet."); }
    finally { setDecidingBid(null); }
  };
  const myActive = [...myListings];
  const favoriteWorks = allArtworks.filter((a) => favorites.includes(a.id));
  const views = myActive.reduce((sum, a) => sum + a.views, 0);

  const cards: Array<[string, string]> = [
    ["Aktive annonser", String(myActive.length)],
    ["Totale visninger", views.toLocaleString("nb-NO")],
    ["Favoritter", String(favorites.length)],
    ["Meldinger", String(conversations.length)],
    ["Aktive bud", String(bids.length)],
    ["Solgt", "0"],
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-5">
      <h1 className="font-display text-2xl font-semibold">Min kunsthandel</h1>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((t) => (
          <Button
            variant="ghost"
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold glass ${
              tab === t ? "bg-brandink text-primary-foreground" : "bg-white/60"
            }`}
          >
            {t}
            {t === "Bud" && <UnreadBadge count={unreadBids} />}
          </Button>
        ))}
      </div>

      {tab === "Oversikt" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            {cards.map(([k, v]) => (
              <div key={k} className="rounded-2xl p-4 glass">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">{k}</p>
                <p className="font-display text-2xl font-semibold">{v}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {receivedBids.length > 0 && <Button onClick={() => setTab("Bud")} variant="outline">Mottatte bud ({receivedBids.length}) <UnreadBadge count={unreadBids} /></Button>}
            <Link
              to="/selg"
              className="rounded-2xl bg-brandink px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Legg ut kunst
            </Link>
            <Link to="/meldinger" className="rounded-2xl bg-white/70 px-5 py-3 text-sm font-semibold text-brandink glass">
              Meldinger
            </Link>
            {isAdmin && <Link to="/admin" className="rounded-2xl bg-white/70 px-5 py-3 text-sm font-semibold text-brandink glass">
              Adminpanel
            </Link>}
          </div>
        </>
      )}

      {tab === "Min profil" && (
        <section className="mt-5 max-w-xl rounded-3xl bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-display text-lg font-semibold">Min profil</h2>
          <ProfileForm />
        </section>
      )}

      {tab === "Mine annonser" && (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          {myActive.map((a) => {
            const isMine = myListings.some((l) => l.id === a.id);
            return (
              <div key={a.id} className="relative">
                <ArtworkCard artwork={a} />
                {isMine && (
                  <div className="mt-2 flex gap-2">
                    <Link
                      to="/rediger/$slug"
                      params={{ slug: a.slug }}
                      className="flex-1 rounded-2xl bg-white/70 px-3 py-2 text-center text-xs font-semibold text-brandink glass"
                    >
                      Endre
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm(`Slette «${a.title}»? Dette kan ikke angres.`)) {
                          deleteListing(a.id);
                        }
                      }}
                      className="flex-1 rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 glass"
                    >
                      Slett
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "Favoritter" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            {favoriteWorks.map((a) => (
              <ArtworkCard key={a.id} artwork={a} />
            ))}
          </div>
          <h2 className="mt-6 text-sm font-bold">Mine samlinger</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(collections).map(([name, ids]) => (
              <span key={name} className="rounded-2xl px-4 py-2 text-sm font-semibold glass">
                {name} · {ids.length}
              </span>
            ))}
          </div>
        </>
      )}

      {tab === "Lagrede søk" && (
        <div className="mt-4 space-y-2">
          {savedSearches.map((s) => (
            <Link
              key={s.id}
              to="/kunst"
              search={{ q: s.query }}
              className="block rounded-2xl p-4 text-sm font-semibold glass"
            >
              {s.label}
              <span className="ml-2 text-xs font-normal text-ink/50">Varsler på nett og e-post</span>
            </Link>
          ))}
        </div>
      )}

      {tab === "Bud" && (
        <div className="mt-4 space-y-2">
          {bidError && <p role="alert" className="text-sm text-destructive">{bidError}</p>}
          {[["Mottatte bud", receivedBids], ["Mine bud", sentBids]].map(([label, list]) => (
            <section key={String(label)} className="mb-6">
            <h2 className="mb-3 font-semibold">{String(label)}</h2>
            {(list as typeof bids).length === 0 && <p className="text-sm text-muted-foreground">Ingen bud ennå.</p>}
            {(list as typeof bids).map((b) => {
              const art = allArtworks.find((a) => a.id === b.artworkId);
              return (
                <div key={b.id} className="rounded-2xl p-4 text-sm glass">
                  <p className="font-semibold">{art?.title}</p>
                  <p className="text-ink/60">
                    {formatPrice(b.amount)} {b.sellerId === user?.id && !b.read && <span className="font-semibold text-brandink">· Nytt bud</span>}
                  </p>
                  {b.message && <p className="mt-1">{b.message}</p>}
                  <p className="mt-2 font-semibold">{b.status === "Sendt" ? "Venter på svar" : b.status === "Godtatt" ? "Godkjent · ikke betalt" : b.status}</p>
                  {b.sellerId === user?.id && b.status === "Sendt" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button disabled={decidingBid !== null} onClick={() => void handleDecision(b.id, "accepted")}>Godkjenn bud</Button>
                      <Button variant="outline" disabled={decidingBid !== null} onClick={() => void handleDecision(b.id, "rejected")}>Avslå bud</Button>
                    </div>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleString("nb-NO")}</p>
                  {b.conversationId && <Button asChild variant="link" className="px-0"><Link to="/meldinger" search={{ c: b.conversationId }} onClick={() => { if (b.sellerId === user?.id) void markBidRead(b.id); }}>Åpne samtale</Link></Button>}
                </div>
              );
            })}
            </section>
          ))}
        </div>
      )}

      {tab === "Følger" && (
        <div className="mt-4 space-y-2">
          {followedArtists.map((id) => {
            const a = artists.find((x) => x.id === id);
            return a ? (
              <Link
                key={id}
                to="/kunstner/$slug"
                params={{ slug: a.slug }}
                className="block rounded-2xl p-4 text-sm font-semibold glass"
              >
                {a.name} <span className="text-xs font-normal text-ink/50">Kunstner</span>
              </Link>
            ) : null;
          })}
          {followedSellers.map((id) => {
            const s = sellers.find((x) => x.id === id);
            return s ? (
              <Link
                key={id}
                to="/profil/$slug"
                params={{ slug: s.slug }}
                className="block rounded-2xl p-4 text-sm font-semibold glass"
              >
                {s.name} <span className="text-xs font-normal text-ink/50">{s.type}</span>
              </Link>
            ) : null;
          })}
        </div>
      )}

      {tab === "Statistikk" && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["Visninger", views.toLocaleString("nb-NO")],
              ["Favoritter", String(myActive.reduce((s, a) => s + a.favorites, 0))],
              ["Henvendelser", String(conversations.length)],
              ["Konvertering", "0 %"],
              ["Bud", String(bids.length)],
              ["Salg", "0"],
              ["Snitt salgstid", "–"],
              ["Snitt salgspris", "–"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl p-4 glass">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">{k}</p>
                <p className="text-lg font-bold">{v}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl p-4 glass">
            <p className="text-sm font-bold">Visninger siste 30 dager</p>
            <div className="mt-3 flex h-32 items-end gap-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-brand/70"
                  style={{ height: `${20 + ((i * 37) % 80)}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "Vurderinger" && (
        <div className="mt-4 space-y-2">
          {([] as typeof reviews).map((r) => (
            <div key={r.id} className="rounded-2xl p-4 glass">
              <p className="text-sm font-semibold">
                {"★".repeat(r.rating)} <span className="text-ink/60">{r.author}</span>
              </p>
              <p className="mt-1 text-sm text-ink/70">{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
