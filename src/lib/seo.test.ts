import { describe, expect, it } from "vitest";
import { applyDocumentSeo, canonicalUrl, isPrivatePath, pageHead, privateHead, DEFAULT_TITLE, NOT_FOUND_TITLE } from "./seo";
import { assertRouteSeo, publicSitemapPaths, routeSeoIssue, sitemapXml } from "./seo-guard";
import { decodeDataImage, withPublicImages } from "./listing-image-url";

describe("pageHead", () => {
  it("matches title, canonical and organization facts", () => {
    const head = pageHead({
      title: "Selg kunst på Diargio",
      description: "Det koster ingenting å legge ut en annonse.",
      path: "/selg",
      breadcrumbs: [
        { name: "Forsiden", path: "/" },
        { name: "Selg kunst", path: "/selg" },
      ],
    });
    const titleMeta = head.meta.find((item) => "title" in item);
    const title = titleMeta && "title" in titleMeta ? titleMeta.title : undefined;
    const ogTitle = head.meta.find((item) => "property" in item && item.property === "og:title");
    const ogUrl = head.meta.find((item) => "property" in item && item.property === "og:url");
    expect(title).toBe("Selg kunst på Diargio");
    expect(ogTitle && "content" in ogTitle ? ogTitle.content : "").toBe(title);
    expect(head.links?.[0]).toEqual({ rel: "canonical", href: "https://diargio.com/selg" });
    expect(ogUrl && "content" in ogUrl ? ogUrl.content : "").toBe("https://diargio.com/selg");
    const json = head.scripts?.[0]?.children ?? "";
    expect(json).toContain("Diargio AS");
    expect(json).toContain("938724148");
    expect(json).toContain("post@diargio.com");
    expect(json).toContain("https://diargio.com");
    expect(json).toContain("BreadcrumbList");
    expect(json).toContain("WebSite");
  });

  it("can noindex a public route that has nothing to show", () => {
    const head = pageHead({ title: NOT_FOUND_TITLE, description: "Borte", path: "/kunst/mangler", noindex: true });
    expect(head.meta).toContainEqual({ name: "robots", content: "noindex" });
  });
});

describe("private pages", () => {
  it("marks account, auth and admin paths", () => {
    expect(isPrivatePath("/min-side")).toBe(true);
    expect(isPrivatePath("/meldinger")).toBe(true);
    expect(isPrivatePath("/varsler")).toBe(true);
    expect(isPrivatePath("/auth/recovery")).toBe(true);
    expect(isPrivatePath("/diargioadmin007")).toBe(true);
    expect(isPrivatePath("/kjop/hav")).toBe(true);
    expect(isPrivatePath("/kunst")).toBe(false);
    expect(isPrivatePath("/kunstner/astrid")).toBe(false);
    expect(isPrivatePath("/selg")).toBe(false);
  });

  it("noindexes private heads", () => {
    expect(privateHead("Meldinger | Diargio", "Samtaler").meta).toContainEqual({ name: "robots", content: "noindex" });
  });
});

describe("document seo", () => {
  const shell = (title = DEFAULT_TITLE) => `<!doctype html><html><head><title>${title}</title><meta name="description" content="Diargio er markedsplassen for kunst i Norge. Kjøp og selg originalkunst, trykk og fotografi."/></head><body></body></html>`;

  it("gives private shells noindex and their own title", () => {
    const html = applyDocumentSeo(shell(), { pathname: "/meldinger", status: 200 });
    expect(html).toContain("<title>Meldinger | Diargio</title>");
    expect(html).toContain('name="robots" content="noindex"');
    expect(html).toContain('property="og:title" content="Meldinger | Diargio"');
    expect(html).not.toContain('rel="canonical"');
  });

  it("gives the not-found document its own title and keeps the status contract in the markup", () => {
    const html = applyDocumentSeo(shell(), { pathname: "/finnes-ikke", status: 404 });
    expect(html).toContain(`<title>${NOT_FOUND_TITLE}</title>`);
    expect(html).toContain('name="robots" content="noindex"');
    expect(html).toContain('property="og:title" content="Siden finnes ikke | Diargio"');
  });

  it("adds a self-referencing canonical when a public page forgot one, and aligns og:title", () => {
    const html = applyDocumentSeo(shell("Kunst til salgs i Norge | Diargio"), { pathname: "/kunst", status: 200 });
    expect(html).toContain('rel="canonical" href="https://diargio.com/kunst"');
    expect(html).toContain('property="og:url" content="https://diargio.com/kunst"');
    expect(html).toContain('property="og:title" content="Kunst til salgs i Norge | Diargio"');
    expect(html).toContain("Diargio AS");
  });
});

describe("route guard and sitemap", () => {
  it("rejects a public route without page metadata", () => {
    expect(routeSeoIssue("ny.tsx", "export const Route = createFileRoute('/ny')({ component() { return null } })")).toMatch(/pageHead/);
    expect(routeSeoIssue("_authenticated/hemmelig.tsx", "export const Route = createFileRoute('/_authenticated/hemmelig')({})")).toMatch(/privateHead/);
    expect(routeSeoIssue("api/public/payments/webhook.ts", "export const Route = createFileRoute('/api/public/payments/webhook')({})")).toBeNull();
  });

  it("accepts the routes in this repo and writes only public urls", () => {
    expect(() => assertRouteSeo()).not.toThrow();
    const paths = publicSitemapPaths();
    expect(paths).toContain("/");
    expect(paths).toContain("/selg");
    expect(paths).toContain("/info/priser-og-gebyrer");
    expect(paths.some((page) => page.startsWith("/min-side") || page.startsWith("/auth") || page.startsWith("/kjop"))).toBe(false);
    expect(sitemapXml(paths)).toContain("<loc>https://diargio.com/selg</loc>");
    expect(canonicalUrl("/")).toBe("https://diargio.com/");
  });
});

describe("listing images", () => {
  it("replaces inlined image data with a file url", () => {
    const artwork = withPublicImages(
      { id: "verk-1", image: "data:image/jpeg;base64,aa", images: ["data:image/jpeg;base64,aa", "https://cdn.example/verk.jpg"] },
      "2026-11-10T00:00:00.000Z",
    );
    expect(artwork.image).toBe("/annonsebilde/verk-1?v=2026-11-10T00%3A00%3A00.000Z");
    expect(artwork.images?.[1]).toBe("https://cdn.example/verk.jpg");
    expect(artwork.image?.startsWith("data:")).toBe(false);
  });

  it("decodes a jpeg data url into bytes", () => {
    const bytes = Uint8Array.from([0xff, 0xd8, 0xff, 0xd9]);
    const b64 = Buffer.from(bytes).toString("base64");
    const decoded = decodeDataImage(`data:image/jpeg;base64,${b64}`);
    expect(decoded?.type).toBe("image/jpeg");
    expect(Array.from(decoded?.bytes ?? [])).toEqual([0xff, 0xd8, 0xff, 0xd9]);
  });
});
