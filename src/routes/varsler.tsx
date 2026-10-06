import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/varsler")({
  head: () => ({
    meta: [
      { title: "Varsler | Diargio" },
      { name: "description", content: "Bud, meldinger, prisendringer og treff på lagrede søk." },
      { property: "og:title", content: "Varsler | Diargio" },
      { property: "og:description", content: "Alle varslene dine fra markedsplassen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { notifications, markAllRead, markBidRead } = useStore();
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Varsler</h1>
        <Button variant="ghost" onClick={markAllRead} className="text-xs font-semibold text-brandink">
          Merk alle som lest
        </Button>
      </div>
      <div className="mt-4 space-y-2">
        {!notifications.length && <p className="text-sm text-muted-foreground">Ingen varsler ennå.</p>}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-2xl p-4 glass ${n.read ? "opacity-70" : "bg-lav/40"}`}
          >
            <p className="text-sm font-semibold">{n.title}</p>
            <p className="text-sm text-ink/70">{n.body}</p>
            {n.conversationId && <Button asChild variant="link" className="px-0"><Link to="/min-side" search={{ tab: "Bud" }} onClick={() => { void markBidRead(n.id); }}>Godkjenn eller avslå bud</Link></Button>}
            <p className="mt-1 text-[11px] text-ink/40">
              {new Date(n.createdAt).toLocaleString("nb-NO")}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
