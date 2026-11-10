import fs from "node:fs";
import path from "node:path";
import { infoPages } from "./info-pages";
import { SITE_ORIGIN } from "./seo";

const PRIVATE_FILES = new Set(["ordre.tsx", "kjop.$slug.tsx", "kunstneroppgjor.tsx", "dealroom.$slug.tsx"]);

export const STATIC_PUBLIC_PATHS = ["/", "/kunst", "/sok", "/selg", "/utstillinger", "/kunstvegg", "/galleriplass"];

export function publicSitemapPaths() {
  return [...STATIC_PUBLIC_PATHS, ...Object.keys(infoPages).sort().map((page) => `/info/${page}`)];
}

export function sitemapXml(paths: string[]) {
  const urls = paths
    .map((page) => `  <url><loc>${SITE_ORIGIN}${page === "/" ? "/" : page}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function routeSeoIssue(relativePath: string, source: string): string | null {
  const rel = relativePath.replaceAll("\\", "/");
  if (!source.includes("createFileRoute")) return null;
  if (rel.startsWith("api/") || rel.startsWith("lovable/") || rel === "annonsebilde.$id.ts") return null;
  if (rel === "__root.tsx") {
    if (!source.includes("NOT_FOUND_TITLE")) return "__root.tsx must set NOT_FOUND_TITLE";
    if (!source.includes("noindex")) return "__root.tsx must noindex the not-found page";
    return null;
  }
  const isPrivate = rel.startsWith("_authenticated/") || rel.startsWith("auth.") || PRIVATE_FILES.has(rel);
  if (isPrivate) {
    if (!source.includes("privateHead(")) return `${rel} is private and must call privateHead()`;
    return null;
  }
  if (!source.includes("pageHead(") && !source.includes("visualHead(")) return `${rel} is public and must call pageHead()`;
  return null;
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith(".ts") || full.endsWith(".tsx") ? [full] : [];
  });
}

export function assertRouteSeo(root = process.cwd()) {
  const routesDir = path.join(root, "src/routes");
  const issues = walk(routesDir)
    .map((file) => routeSeoIssue(path.relative(routesDir, file), fs.readFileSync(file, "utf8")))
    .filter((issue): issue is string => Boolean(issue));
  const visual = fs.readFileSync(path.join(root, "src/lib/visual-art.ts"), "utf8");
  if (!visual.includes("pageHead(")) issues.push("src/lib/visual-art.ts must build heads with pageHead()");
  if (issues.length) throw new Error(`SEO metadata check failed:\n${issues.join("\n")}`);
}

export function writeSitemap(root = process.cwd()) {
  const file = path.join(root, "public/sitemap.xml");
  fs.writeFileSync(file, sitemapXml(publicSitemapPaths()));
  return file;
}
