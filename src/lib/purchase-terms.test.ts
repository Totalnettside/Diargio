import { describe, expect, it } from "vitest";
import { infoPages, type InfoPage } from "./info-pages";
import { publicSitemapPaths } from "./seo-guard";
import { KUNSTVEGG_ENABLED } from "./features";

function page(slug: string): InfoPage {
  const found = infoPages[slug];
  if (!found) throw new Error(`Info-side mangler: ${slug}`);
  return found;
}

function section(terms: InfoPage, heading: string): string {
  const found = terms.sections.find((s) => s.h === heading);
  if (!found) throw new Error(`Seksjon mangler: ${heading}`);
  return found.p.join(" ");
}

describe("launch scope", () => {
  it("keeps the art wall out of the public site until it is launched", () => {
    expect(KUNSTVEGG_ENABLED).toBe(false);
    expect(publicSitemapPaths()).not.toContain("/kunstvegg");
  });
});

describe("purchase terms", () => {
  const terms = page("kjopsvilkaar");

  it("publishes the purchase terms page with every section", () => {
    expect(terms.title).toBe("Kjøpsvilkår");
    expect(terms.sections.map((s) => s.h)).toEqual([
      "Hvem du handler med",
      "Om verket og annonsen",
      "Bud og avtale",
      "Pris, avgifter og levering",
      "Hvis verket ikke er som avtalt",
      "Angrerett",
    ]);
  });

  it("names the seller, the company details and the art fee threshold", () => {
    const who = section(terms, "Hvem du handler med");
    expect(who).toContain("Diargio AS er selger");
    expect(who).toContain("938 724 148");
    expect(who).toContain("post@diargio.com");
    expect(who).toContain("Magnus Lagabøters veg 8, 7047 Trondheim");
    expect(section(terms, "Pris, avgifter og levering")).toContain("2 000 kr");
  });
});
