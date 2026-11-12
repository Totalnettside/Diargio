import { describe, expect, it } from "vitest";
import { sellerFirstName } from "./seller-name";

describe("seller names on listings", () => {
  it("shows the first name without the seller's surname", () => {
    expect(sellerFirstName("Kevin Kolaas Aleksandersen")).toBe("Kevin");
    expect(sellerFirstName("  marianne   Ludvigsen ")).toBe("marianne");
    expect(sellerFirstName("Anne-Marie Johansen")).toBe("Anne-Marie");
  });
  it("uses a safe label when no seller name exists", () => {
    expect(sellerFirstName(null)).toBe("Selger");
    expect(sellerFirstName("  ")).toBe("Selger");
  });
});