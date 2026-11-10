export const SITE_ORIGIN = "https://diargio.com";
export const DEFAULT_TITLE = "Diargio – kjøp og selg kunst i Norge";
export const NOT_FOUND_TITLE = "Siden finnes ikke | Diargio";
export const NOT_FOUND_DESCRIPTION = "Siden finnes ikke, eller annonsen er fjernet.";
export const OG_IMAGE_PATH = "/og.jpg";
export const OG_IMAGE = `${SITE_ORIGIN}${OG_IMAGE_PATH}`;

export type Crumb = { name: string; path: string };

type Meta =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }
  | { charSet: string };

type LinkTag = { rel: string; href: string; type?: string; sizes?: string; crossOrigin?: "anonymous" };

type Head = {
  meta: Meta[];
  links?: LinkTag[];
  scripts?: { type: string; children: string }[];
};

const PRIVATE_PAGES: { prefix: string; title: string; description: string }[] = [
  { prefix: "/diargioadmin007", title: "Kontrollsenter | Diargio", description: "Administrer brukere, annonser, transaksjoner og moderering." },
  { prefix: "/kunstneroppgjor", title: "Kunstneroppgjør | Diargio", description: "Koble betalingskonto for framtidig kunstneroppgjør." },
  { prefix: "/auth/callback", title: "Kontobekreftelse | Diargio", description: "Bekreft endringen på Diargio-kontoen din." },
  { prefix: "/auth/recovery", title: "Glemt passord | Diargio", description: "Tilbakestill passordet til Diargio-kontoen din." },
  { prefix: "/auth/reset", title: "Nytt passord | Diargio", description: "Velg et nytt passord etter sikker gjenoppretting." },
  { prefix: "/auth/vipps", title: "Innloggingsvalg fjernet | Diargio", description: "Bruk e-post eller Google for innlogging." },
  { prefix: "/auth", title: "Logg inn – Diargio", description: "Logg inn på Diargio med e-post eller Google for å kjøpe og selge kunst." },
  { prefix: "/min-side", title: "Min kunsthandel | Diargio", description: "Oversikt over annonser, bud, favoritter, lagrede søk, salg og statistikk." },
  { prefix: "/meldinger", title: "Meldinger | Diargio", description: "Samtaler med kjøpere og selgere, koblet til kunstverket." },
  { prefix: "/varsler", title: "Varsler | Diargio", description: "Bud, meldinger, prisendringer og treff på lagrede søk." },
  { prefix: "/rediger", title: "Endre annonse | Diargio", description: "Rediger eller slett annonsen din." },
  { prefix: "/dealroom", title: "Dealroom | Diargio", description: "Virtuelt dealroom der kjøper og selger ser verket, chatter og gir bud." },
  { prefix: "/ordre", title: "Ordre og oppgjør | Diargio", description: "Dine kunstkjøp, leveranser og betalingsstatus." },
  { prefix: "/kjop", title: "Kjøp kunst | Diargio", description: "Kjøp kunst med én totalpris og frakt separat." },
  { prefix: "/annonsebilde", title: "Bilde | Diargio", description: "Bilde fra en annonse på Diargio." },
  { prefix: "/api", title: "Diargio", description: "Diargio." },
  { prefix: "/lovable", title: "Diargio", description: "Diargio." },
].sort((a, b) => b.prefix.length - a.prefix.length);

export function isPrivatePath(pathname: string) {
  const path = pathname.split("?")[0] || "/";
  return PRIVATE_PAGES.some((page) => path === page.prefix || path.startsWith(`${page.prefix}/`));
}

export function privatePageFor(pathname: string) {
  const path = pathname.split("?")[0] || "/";
  return (
    PRIVATE_PAGES.find((page) => path === page.prefix || path.startsWith(`${page.prefix}/`)) ?? {
      prefix: path,
      title: "Konto | Diargio",
      description: "Siden er for innloggede brukere på Diargio.",
    }
  );
}

export function privateTitleFor(pathname: string) {
  return privatePageFor(pathname).title;
}

export function canonicalUrl(path: string) {
  if (path === "/" || path === "") return `${SITE_ORIGIN}/`;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${clean.split("?")[0]}`;
}

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#organization`,
    name: "Diargio AS",
    url: SITE_ORIGIN,
    email: "post@diargio.com",
    logo: `${SITE_ORIGIN}/diargio-logo.png`,
    taxID: "938724148",
    identifier: {
      "@type": "PropertyValue",
      name: "Organisasjonsnummer",
      value: "938724148",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#website`,
    name: "Diargio",
    url: SITE_ORIGIN,
    inLanguage: "nb",
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
  };
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: canonicalUrl(crumb.path),
    })),
  };
}

function absoluteImage(src: string | undefined) {
  if (!src || src.startsWith("data:")) return OG_IMAGE;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/")) return `${SITE_ORIGIN}${src}`;
  return OG_IMAGE;
}

export function pageHead(options: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  breadcrumbs?: Crumb[];
  jsonLd?: object[];
  image?: string;
  ogType?: string;
}): Head {
  const url = canonicalUrl(options.path);
  const image = absoluteImage(options.image);
  const graph: object[] = [organizationJsonLd(), websiteJsonLd()];
  if (options.breadcrumbs?.length) graph.push(breadcrumbJsonLd(options.breadcrumbs));
  if (options.jsonLd) graph.push(...options.jsonLd);
  const meta: Meta[] = [
    { title: options.title },
    { name: "description", content: options.description },
    { property: "og:title", content: options.title },
    { property: "og:description", content: options.description },
    { property: "og:url", content: url },
    { property: "og:type", content: options.ogType ?? "website" },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: options.title },
    { property: "og:locale", content: "nb_NO" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: options.title },
    { name: "twitter:description", content: options.description },
    { name: "twitter:image", content: image },
  ];
  if (options.noindex) meta.push({ name: "robots", content: "noindex" });
  return {
    meta,
    links: [{ rel: "canonical", href: url }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) }],
  };
}

export function privateHead(title: string, description: string): Head {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
    ],
  };
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function decodeHtml(value: string) {
  return value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function upsertMeta(html: string, attr: "name" | "property", key: string, content: string) {
  const tag = `<meta ${attr}="${key}" content="${escapeHtml(content)}"/>`;
  const pattern = new RegExp(`<meta\\s[^>]*${attr}="${key}"[^>]*>`, "i");
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `${tag}</head>`);
}

function upsertCanonical(html: string, href: string) {
  const tag = `<link rel="canonical" href="${escapeHtml(href)}"/>`;
  const pattern = /<link\s[^>]*rel="canonical"[^>]*>/i;
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `${tag}</head>`);
}

function replaceTitle(html: string, title: string) {
  const tag = `<title>${escapeHtml(title)}</title>`;
  if (/<title>[^<]*<\/title>/.test(html)) return html.replace(/<title>[^<]*<\/title>/, tag);
  return html.replace("</head>", `${tag}</head>`);
}

function currentTitle(html: string) {
  const match = html.match(/<title>([^<]*)<\/title>/);
  return match ? decodeHtml(match[1] ?? "") : "";
}

export function applyDocumentSeo(html: string, input: { pathname: string; status: number }) {
  if (!html.includes("<head") || !html.includes("</head>")) return html;
  let next = html;
  const privatePage = isPrivatePath(input.pathname);
  const notFound = input.status === 404;
  if (notFound && (currentTitle(next) === DEFAULT_TITLE || currentTitle(next) === "")) {
    next = replaceTitle(next, NOT_FOUND_TITLE);
    next = upsertMeta(next, "name", "description", NOT_FOUND_DESCRIPTION);
  } else if (privatePage && currentTitle(next) === DEFAULT_TITLE) {
    const page = privatePageFor(input.pathname);
    next = replaceTitle(next, page.title);
    next = upsertMeta(next, "name", "description", page.description);
  }
  if (notFound || privatePage) next = upsertMeta(next, "name", "robots", "noindex");
  const title = currentTitle(next);
  if (title) {
    next = upsertMeta(next, "property", "og:title", title);
    next = upsertMeta(next, "name", "twitter:title", title);
  }
  if (!notFound && !privatePage && input.status >= 200 && input.status < 300) {
    const url = canonicalUrl(input.pathname);
    next = upsertCanonical(next, url);
    next = upsertMeta(next, "property", "og:url", url);
    if (!next.includes("application/ld+json")) {
      const crumbs = input.pathname === "/" ? [] : [{ name: "Forsiden", path: "/" }, { name: title || "Diargio", path: input.pathname }];
      const graph = [organizationJsonLd(), websiteJsonLd(), ...(crumbs.length ? [breadcrumbJsonLd(crumbs)] : [])];
      next = next.replace("</head>", `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script></head>`);
    }
    if (!next.includes("og:image")) next = upsertMeta(next, "property", "og:image", OG_IMAGE);
  }
  return next;
}
