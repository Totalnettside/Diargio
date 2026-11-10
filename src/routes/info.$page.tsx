import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { infoPages } from "@/lib/info-pages";
import { NOT_FOUND_DESCRIPTION, NOT_FOUND_TITLE, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/info/$page")({
  loader: ({ params }) => {
    const page = infoPages[params.page];
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData, params }) => {
    const path = `/info/${params.page}`;
    if (!loaderData) return pageHead({ title: NOT_FOUND_TITLE, description: NOT_FOUND_DESCRIPTION, path, noindex: true });
    return pageHead({
      title: `${loaderData.title} | Diargio`,
      description: loaderData.description ?? loaderData.lead,
      path,
      ogType: "article",
      breadcrumbs: [{ name: "Forsiden", path: "/" }, { name: loaderData.title, path }],
    });
  },
  component: InfoPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Siden finnes ikke</h1>
      <Link to="/" className="mt-4 inline-block underline">Til forsiden</Link>
    </div>
  ),
});

function InfoPage() {
  const page = Route.useLoaderData();
  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-semibold">{page.title}</h1>
      <p className="mt-3 text-lg text-ink/70">{page.lead}</p>
      {page.intro?.map((t) => (
        <p key={t} className="mt-4 text-ink/80">{t}</p>
      ))}
      {page.sections.map((s) => (
        <section key={s.h} className="mt-8">
          <h2 className="text-lg font-semibold">{s.h}</h2>
          {s.p.map((t) => (
            <p key={t} className="mt-2 text-ink/80">{t}</p>
          ))}
        </section>
      ))}
      {page.outro && <p className="mt-8 font-medium text-ink">{page.outro}</p>}
      {page.cta && (
        <Link to={page.cta.to} className="mt-10 inline-block rounded-md bg-sage px-5 py-2.5 text-sm font-medium text-white hover:bg-sagelight">
          {page.cta.label}
        </Link>
      )}
    </article>
  );
}
