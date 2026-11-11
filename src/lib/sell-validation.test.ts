import { describe, expect, it } from "vitest";
import { clearResolvedTitleError, missingTitleMessage } from "./sell-validation";

describe("sell title validation", () => {
  it("clears the missing-title message as soon as a name is entered", () => {
    expect(clearResolvedTitleError(missingTitleMessage, "Speil i Nidelva")).toBe("");
  });

  it("keeps the message while the name is empty or only whitespace", () => {
    expect(clearResolvedTitleError(missingTitleMessage, "")).toBe(missingTitleMessage);
    expect(clearResolvedTitleError(missingTitleMessage, "   ")).toBe(missingTitleMessage);
  });

  it("does not clear unrelated image errors", () => {
    const error = "Last opp minst ett bilde før du går videre.";
    expect(clearResolvedTitleError(error, "Speil i Nidelva")).toBe(error);
  });
});
