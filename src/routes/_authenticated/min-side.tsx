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
import {AccountSecurity} from "@/components/AccountSecurity";
import { SavedWalls } from "@/components/visual/SavedWalls";
import {moderationLabels,submissionConfirmation} from '@/lib/moderation';
import {ArtworkPreview} from '@/components/ArtworkPreview';
import {useActionDialog,listingDeletionDescription} from '@/components/ActionDialogs';
import {useNavigate} from '@tanstack/react-router';

export const Route = createFileRoute("/_authenticated/min-side")({
  validateSearch: (s: Record<string, unknown>): { tab?: string } => (typeof s["tab"] === "string" ? { tab: s["tab"] } : {}),
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
  "Kunstvegger",
  "Lagrede søk",
  "Bud",
  "Følger",
  "Statistikk",
  "Vurderinger",
] as const;

function Dashboard() {
  const dialog=useActionDialog();
  const navigate=useNavigate();
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
    changeVisibility,
  } = useStore();
  const { isAdmin } = useIsAdmin();
  const { user } = useAuth();
  const { conversations } = useChat();
  const receivedBids = bids.filter((b) => b.sellerId === user?.id);
  const sentBids = bids.filter((b) => b.buyerId === user?.id);
  const unreadBids = receivedBids.filter((b) => !b.read).length;
  const initialTab = Route.useSearch().tab;
  const [tab, setTab] = useState<(typeof tabs)[number]>(() => { const t = initialTab; return (tabs as readonly string[]).includes(t ?? "") ? (t as (typeof tabs)[number]) : "Oversikt"; });
  const [decidingBid, setDecidingBid] = useState<string | null>(null);
  const [bidError, setBidError] = useState("");
  const handleDecision = async (id: string, decision: "accepted" | "rejected") => {
    dialog({title:decision==='accepted'?'Godkjenne budet?':'Avslå budet?',description:decision==='accepted'?'Betaling er ikke gjennomført. Kjøperen får beskjed om at budet er godkjent.':'Kjøperen får beskjed om at budet er avslått.',confirmLabel:decision==='accepted'?'Godkjenn bud':'Avslå bud',success:'Budet er behandlet',action:async()=>{
    setDecidingBid(id);
    setBidError("");
    try { await decideBid(id, decision); }
    catch (error) { throw error; }
    finally { setDecidingBid(null); }
    }});
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
      <Button asChild variant="outline" className="mt-3 mr-3"><Link to="/ordre">Kjøp, salg og oppgjør</Link></Button>
      <Button asChild variant="outline" className="mt-3"><Link to="/galleriplass" search={{ room: 2 }}>Still ut i galleriet</Link></Button>

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
            {isAdmin && <Link to="/diargioadmin007" className="rounded-2xl bg-white/70 px-5 py-3 text-sm font-semibold text-brandink glass">
              Adminpanel
            </Link>}
          </div>
        </>
      )}

      {tab === "Kunstvegger" && <SavedWalls />}
      {tab === "Min profil" && (
        <section className="mt-5 max-w-xl rounded-3xl bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-display text-lg font-semibold">Min profil</h2>
          <ProfileForm /><AccountSecurity />

        </section>
      )}

      {tab === "Mine annonser" && (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          {myActive.map((a) => {
            const isMine = myListings.some((l) => l.id === a.id);
            return (
              <div key={a.id} className="relative">
                <ArtworkPreview image={a.image} alt={a.title}/>
                <h3 className="mt-2 font-semibold">{a.title}</h3>
                <p className="text-sm text-primary">{moderationLabels[a.moderationStatus as keyof typeof moderationLabels]??'Publisert'}</p>
                {a.moderationStatus==='pending'&&<p className="mt-2 text-xs text-muted-foreground">{submissionConfirmation}</p>}
                {a.sellerMessage&&<p className="mt-2 text-sm">Beskjed fra Diargio: {a.sellerMessage}</p>}
                {isMine && (
                  <div className="mt-2 flex gap-2">
                    <Link
                      to="/rediger/$slug"
                      params={{ slug: a.slug }}
                      className="flex-1 rounded-2xl bg-white/70 px-3 py-2 text-center text-xs font-semibold text-brandink glass"
                    >
                      Endre
                    </Link>
                    <Button variant="outline"
                      onClick={() => dialog({title:'Slette annonsen?',description:listingDeletionDescription(a.title),confirmLabel:'Slett annonsen',busyLabel:'Sletter …',destructive:true,success:'Annonsen er slettet',action:async()=>{await deleteListing(a.id);setTab('Mine annonser');await navigate({to:'/min-side',search:{tab:'Mine annonser'}});}})}
                      className="text-xs"
                    >
                      Slett
                    </Button>
                  </div>
                )}
                {a.moderationStatus!=='sold'&&<div className="flex flex-wrap gap-1"><Button variant="ghost" className="mt-2 text-xs" onClick={()=>dialog({title:'Trekke annonsen fra salg?',description:'Annonsen blir skjult for kjøpere. Du beholder den under Mine annonser.',confirmLabel:'Trekk fra salg',success:'Annonsen er trukket fra salg',action:()=>changeVisibility(a.id,'withdrawn')})}>Trekk fra salg</Button><Button variant="ghost" className="mt-2 text-xs" onClick={()=>dialog({title:'Markere verket som solgt?',description:'Annonsen kan ikke lenger kjøpes. Dette registrerer ingen betaling eller nytt oppgjør.',confirmLabel:'Marker som solgt',action:()=>changeVisibility(a.id,'sold')})}>Marker som solgt</Button></div>}
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
              <span className="ml-2 text-xs font-normal text-ink/50">Lagret søk</span>
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
                  {b.buyerId===user?.id&&b.status==="Godtatt"&&art&&<Button asChild className="mt-2"><Link to="/kjop/$slug" params={{slug:art.slug}} search={{bid:b.id}}>Betal godkjent bud</Link></Button>}
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
            return (
              <Link
                key={id}
                to="/selger/$id"
                params={{ id }}
                className="block rounded-2xl p-4 text-sm font-semibold glass"
              >
                {s?.name??"Kunstnerprofil"} <span className="text-xs font-normal text-ink/50">Kunstner</span>
              </Link>
            );
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
            <p className="mt-3 text-sm text-muted-foreground">Visningsmåling er ikke aktivert. Ingen historikk er beregnet.</p>
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
