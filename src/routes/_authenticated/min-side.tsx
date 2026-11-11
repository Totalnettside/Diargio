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
import { privateHead, privatePageFor } from '@/lib/seo';
import { KUNSTVEGG_ENABLED } from '@/lib/features';
import { ArrowRight, BarChart3, BadgeCheck, Clock3, Eye, Gavel, Heart, Inbox, LayoutGrid, MessageCircle, MessageSquareQuote, Palette, Plus, Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/min-side")({
  validateSearch: (s: Record<string, unknown>): { tab?: string } => (typeof s["tab"] === "string" ? { tab: s["tab"] } : {}),
  head: () => {
    const page = privatePageFor("/min-side");
    return privateHead(page.title, page.description);
  },
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

const visibleTabs = KUNSTVEGG_ENABLED ? tabs : tabs.filter((t) => t !== "Kunstvegger");

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
  const [tab, setTab] = useState<(typeof tabs)[number]>(() => { const t = initialTab; return (visibleTabs as readonly string[]).includes(t ?? "") ? (t as (typeof tabs)[number]) : "Oversikt"; });
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

  const cards = [
    { label: "Aktive annonser", value: String(myActive.length), detail: "Kunst du har lagt ut", icon: LayoutGrid },
    { label: "Totale visninger", value: views.toLocaleString("nb-NO"), detail: "På dine annonser", icon: Eye },
    { label: "Favoritter", value: String(favorites.length), detail: "Verk du har lagret", icon: Heart },
    { label: "Meldinger", value: String(conversations.length), detail: "Samtaler med kjøpere og selgere", icon: MessageCircle },
    { label: "Aktive bud", value: String(bids.length), detail: "Mottatte og sendte bud", icon: Gavel },
    { label: "Solgt", value: "0", detail: "Registrerte salg", icon: BadgeCheck },
  ];
  const statsCards = [
    { label: "Visninger", value: views.toLocaleString("nb-NO"), icon: Eye },
    { label: "Favoritter", value: String(myActive.reduce((s, a) => s + a.favorites, 0)), icon: Heart },
    { label: "Henvendelser", value: String(conversations.length), icon: MessageCircle },
    { label: "Konvertering", value: "0 %", icon: BarChart3 },
    { label: "Bud", value: String(bids.length), icon: Gavel },
    { label: "Salg", value: "0", icon: BadgeCheck },
    { label: "Snitt salgstid", value: "–", icon: Clock3 },
    { label: "Snitt salgspris", value: "–", icon: Sparkles },
  ];
  const mostViewed = [...myActive].sort((a, b) => b.views - a.views).slice(0, 3);

  return (
    <main className="account-dashboard mx-auto w-full max-w-6xl px-5 py-5">
      <header className="account-hero">
        <div className="account-hero-content">
          <p className="account-eyebrow">Ditt Diargio</p>
          <h1 className="account-hero-title">Min kunsthandel</h1>
          <p className="account-hero-description">Annonser, bud og aktivitet – samlet på ett rolig sted.</p>
        </div>
        <div className="account-hero-actions">
          <Button asChild variant="ghost" className="account-hero-button account-hero-button-primary"><Link to="/ordre">Kjøp, salg og oppgjør <ArrowRight /></Link></Button>
          <Button asChild variant="ghost" className="account-hero-button"><Link to="/galleriplass" search={{ room: 2 }}><Palette /> Still ut i galleriet</Link></Button>
        </div>
      </header>

      <nav aria-label="Min side" className="account-tabs mt-5 flex gap-1 overflow-x-auto no-scrollbar">
        {visibleTabs.map((t) => (
          <Button
            variant="ghost"
            key={t}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`account-tab shrink-0 ${tab === t ? "is-active" : ""}`}
          >
            {t}
            {t === "Bud" && <UnreadBadge count={unreadBids} />}
          </Button>
        ))}
      </nav>

      {tab === "Oversikt" && (
        <section className="account-section" aria-labelledby="account-overview-title">
          <div className="account-section-heading">
            <div><p className="account-kicker">Din aktivitet</p><h2 id="account-overview-title">Et raskt overblikk</h2></div>
            <p>Alt som skjer med kunsten din</p>
          </div>
          <div className="account-metrics">
            {cards.map(({ label, value, detail, icon: Icon }) => (
              <article key={label} className="account-metric">
                <div className="account-metric-top"><p>{label}</p><span className="account-metric-icon"><Icon /></span></div>
                <p className="account-metric-value">{value}</p>
                <p className="account-metric-detail">{detail}</p>
              </article>
            ))}
          </div>
          <div className="account-overview-panels">
            <article className="account-panel account-bid-highlight">
              <div className="account-panel-icon"><Gavel /></div>
              <p className="account-kicker">Bud og forhandlinger</p>
              <h3>{receivedBids.length} {receivedBids.length === 1 ? "mottatt bud" : "mottatte bud"}</h3>
              <p>{unreadBids > 0 ? `${unreadBids} nye bud venter på deg.` : "Se status og svar på bud fra interesserte kjøpere."}</p>
              <Button onClick={() => setTab("Bud")} variant="ghost" className="account-hero-button account-hero-button-primary">Gå til bud <ArrowRight /></Button>
            </article>
            <article className="account-panel account-shortcuts">
              <p className="account-kicker">Snarveier</p><h3>Hva vil du gjøre nå?</h3>
              <div className="account-shortcut-list">
                <Link to="/selg"><span className="account-shortcut-icon"><Plus /></span><span><strong>Legg ut kunst</strong><small>Opprett en ny annonse</small></span><ArrowRight /></Link>
                <Link to="/meldinger"><span className="account-shortcut-icon"><MessageCircle /></span><span><strong>Åpne meldinger</strong><small>Fortsett samtalene dine</small></span><ArrowRight /></Link>
                {isAdmin && <Link to="/diargioadmin007"><span className="account-shortcut-icon"><LayoutGrid /></span><span><strong>Adminpanel</strong><small>Administrer Diargio</small></span><ArrowRight /></Link>}
              </div>
            </article>
          </div>
        </section>
      )}

      {KUNSTVEGG_ENABLED && tab === "Kunstvegger" && <SavedWalls />}
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
        <div className="account-section">
          {bidError && <p role="alert" className="mb-4 text-sm text-destructive">{bidError}</p>}
          {([["Mottatte bud", receivedBids], ["Mine bud", sentBids]] as const).map(([label, list]) => {
            const SectionIcon = label === "Mottatte bud" ? Inbox : Send;
            return (
              <section key={label} className="account-bid-section" aria-labelledby={`bids-${label === "Mottatte bud" ? "received" : "sent"}`}>
                <div className="account-section-heading account-bid-heading">
                  <div className="account-bid-heading-title"><span className="account-section-icon"><SectionIcon /></span><div><p className="account-kicker">Forhandlinger</p><h2 id={`bids-${label === "Mottatte bud" ? "received" : "sent"}`}>{label}</h2></div></div>
                  <span className="account-count">{list.length}</span>
                </div>
                {list.length === 0 ? (
                  <div className="account-empty"><Gavel /><div><h3>Ingen bud ennå</h3><p>{label === "Mottatte bud" ? "Nye bud fra kjøpere vises her." : "Bud du sender på kunst vises her."}</p></div></div>
                ) : (
                  <div className="account-bid-list">
                    {list.map((b) => {
                      const art = allArtworks.find((a) => a.id === b.artworkId);
                      const statusLabel = b.status === "Sendt" ? "Venter på svar" : b.status === "Godtatt" ? "Godkjent · ikke betalt" : b.status;
                      return (
                        <article key={b.id} className="account-bid-card">
                          <div className="account-bid-main">
                            <div className="account-bid-art">
                              {art ? <ArtworkPreview image={art.image} alt={art.title} /> : <Gavel />}
                            </div>
                            <div className="account-bid-info">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`account-status status-${b.status.toLowerCase().replace("å", "a")}`}>{statusLabel}</span>
                                {b.sellerId === user?.id && !b.read && <span className="account-new-bid">Nytt bud</span>}
                              </div>
                              {art ? <Link to="/kunst/$slug" params={{ slug: art.slug }} className="account-bid-title">{art.title}</Link> : <h3 className="account-bid-title">Kunstverk</h3>}
                              <p className="account-bid-date">{new Date(b.createdAt).toLocaleString("nb-NO")}</p>
                            </div>
                            <div className="account-bid-amount"><span>Budbeløp</span><strong>{formatPrice(b.amount)}</strong></div>
                          </div>
                          {b.message && <blockquote className="account-bid-message"><MessageSquareQuote /><p>{b.message}</p></blockquote>}
                          {(b.sellerId === user?.id && b.status === "Sendt") || (b.buyerId === user?.id && b.status === "Godtatt" && art) || b.conversationId ? (
                            <div className="account-bid-footer">
                              <div className="account-bid-actions">
                                {b.sellerId === user?.id && b.status === "Sendt" && <>
                                  <Button size="sm" disabled={decidingBid !== null} onClick={() => void handleDecision(b.id, "accepted")}>Godkjenn bud</Button>
                                  <Button size="sm" variant="outline" disabled={decidingBid !== null} onClick={() => void handleDecision(b.id, "rejected")}>Avslå bud</Button>
                                </>}
                                {b.buyerId === user?.id && b.status === "Godtatt" && art && <Button asChild size="sm"><Link to="/kjop/$slug" params={{ slug: art.slug }} search={{ bid: b.id }}>Betal godkjent bud <ArrowRight /></Link></Button>}
                              </div>
                              {b.conversationId && <Button asChild variant="ghost" size="sm" className="account-conversation-link"><Link to="/meldinger" search={{ c: b.conversationId }} onClick={() => { if (b.sellerId === user?.id) void markBidRead(b.id); }}><MessageCircle /> Åpne samtale</Link></Button>}
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
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
        <section className="account-section" aria-labelledby="account-stats-title">
          <div className="account-section-heading">
            <div><p className="account-kicker">Innsikt</p><h2 id="account-stats-title">Slik presterer kunsten din</h2></div>
            <p>Registrert aktivitet på annonsene dine</p>
          </div>
          <div className="account-metrics account-stats-metrics">
            {statsCards.map(({ label, value, icon: Icon }) => (
              <article key={label} className="account-metric account-stat-card">
                <div className="account-metric-top"><p>{label}</p><span className="account-metric-icon"><Icon /></span></div>
                <p className="account-metric-value">{value}</p>
              </article>
            ))}
          </div>
          <div className="account-insight-grid">
            <article className="account-panel account-chart-panel">
              <div className="account-panel-heading"><div><p className="account-kicker">Utvikling</p><h3>Visninger siste 30 dager</h3></div><BarChart3 /></div>
              <div className="account-chart-empty"><span><BarChart3 /></span><p>Ingen historikk er beregnet ennå.</p><small>Visningsmåling er ikke aktivert.</small></div>
            </article>
            <article className="account-panel account-ranking-panel">
              <div className="account-panel-heading"><div><p className="account-kicker">Mest sett</p><h3>Annonser med oppmerksomhet</h3></div><Eye /></div>
              {mostViewed.length > 0 ? <div className="account-ranking-list">{mostViewed.map((artwork, index) => (
                <Link key={artwork.id} to="/kunst/$slug" params={{ slug: artwork.slug }} className="account-ranking-item">
                  <span className="account-ranking-number">0{index + 1}</span>
                  <span className="account-ranking-copy"><strong>{artwork.title}</strong><small>{artwork.views.toLocaleString("nb-NO")} visninger · {artwork.favorites} favoritter</small></span>
                  <ArrowRight />
                </Link>
              ))}</div> : <p className="account-ranking-empty">Legg ut kunst for å se statistikk her.</p>}
            </article>
          </div>
        </section>
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
