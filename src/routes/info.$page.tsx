import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { infoPages } from "@/lib/info-pages";

export const Route = createFileRoute("/info/$page")({
  loader: ({ params }) => {
    const page = infoPages[params.page];
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Info"} | Diargio` },
      { name: "description", content: loaderData?.lead ?? "Informasjon fra Diargio" },
      { property: "og:title", content: `${loaderData?.title ?? "Info"} | Diargio` },
      { property: "og:description", content: loaderData?.lead ?? "Informasjon fra Diargio" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
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
