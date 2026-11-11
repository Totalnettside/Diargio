import { describe, expect, it } from "vitest";
import { infoPages } from "./info-pages";
import { publicSitemapPaths } from "./seo-guard";
import { KUNSTVEGG_ENABLED } from "./features";

describe("launch scope", () => {
  it("keeps the art wall out of the public site until it is launched", () => {
    expect(KUNSTVEGG_ENABLED).toBe(false);
    expect(publicSitemapPaths()).not.toContain("/kunstvegg");
  });
});

describe("purchase terms", () => {
  const terms = infoPages.kjopsvilkaar;

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
    const who = terms.sections[0].p.join(" ");
    expect(who).toContain("Diargio AS er selger");
    expect(who).toContain("938 724 148");
    expect(who).toContain("post@diargio.com");
    expect(who).toContain("Magnus Lagabøters veg 8, 7047 Trondheim");
    expect(terms.sections[3].p.join(" ")).toContain("2 000 kr");
  });

  it("offers a withdrawer-of-angrerett message to copy", () => {
    expect(terms.template?.lines[0]).toBe("Jeg gir beskjed om at jeg ønsker å benytte angreretten for kjøpet av [verkets navn].");
    expect(terms.template?.lines).toContain("Mottatt: [dato]");
  });
});
