import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/varsler")({
  head: () => ({
    meta: [
      { title: "Varsler | Geargio" },
      { name: "description", content: "Bud, meldinger, prisendringer og treff på lagrede søk." },
      { property: "og:title", content: "Varsler | Geargio" },
      { property: "og:description", content: "Alle varslene dine fra markedsplassen." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { notifications, markAllRead } = useStore();
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Varsler</h1>
        <button onClick={markAllRead} className="text-xs font-semibold text-brandink">
          Merk alle som lest
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-2xl p-4 glass ${n.read ? "opacity-70" : "bg-lav/40"}`}
          >
            <p className="text-sm font-semibold">{n.title}</p>
            <p className="text-sm text-ink/70">{n.body}</p>
            <p className="mt-1 text-[11px] text-ink/40">
              {new Date(n.createdAt).toLocaleString("nb-NO")}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
