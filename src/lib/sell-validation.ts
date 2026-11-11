export const missingTitleMessage = "Skriv inn verkets navn før du går videre.";

export function clearResolvedTitleError(error: string, title: string) {
  return error === missingTitleMessage && title.trim() ? "" : error;
}
