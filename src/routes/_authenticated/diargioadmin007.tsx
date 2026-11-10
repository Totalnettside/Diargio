import { createFileRoute } from "@tanstack/react-router";
import { ControlCenter } from "@/components/admin/ControlCenter";
import { Link } from "@tanstack/react-router";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { privateHead, privatePageFor } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/diargioadmin007")({
  head: () => {
    const page = privatePageFor("/diargioadmin007");
    return privateHead(page.title, page.description);
  },
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
