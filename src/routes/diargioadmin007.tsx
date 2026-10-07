import { createFileRoute } from "@tanstack/react-router";
import { ControlCenter } from "@/components/admin/ControlCenter";
import { Link } from "@tanstack/react-router";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/diargioadmin007")({
  head: () => ({
    meta: [
      { title: "Kontrollsenter | Diargio" },
      { name: "description", content: "Administrer brukere, annonser, transaksjoner og moderering." },
      { property: "og:title", content: "Kontrollsenter | Diargio" },
      { property: "og:description", content: "Administrer Diargios markedsplass." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

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
  return <><div className="mx-auto flex max-w-7xl justify-end px-5 pt-5"><Button asChild variant="outline"><Link to="/utstillinger">Administrer utstillinger</Link></Button></div><ControlCenter /></>;
}
