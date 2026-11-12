/** Public listing label only; never changes stored profile or artist names. */
export function sellerFirstName(name: string | null | undefined): string {
  return name?.trim().split(/\s+/)[0] || "Selger";
}