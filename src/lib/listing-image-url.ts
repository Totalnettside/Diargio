const DATA_IMAGE = /^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,([a-z0-9+/=\r\n]+)$/i;
const MAX_BYTES = 4_000_000;

export function listingImagePath(id: string, index = 0, version?: string) {
  const params = new URLSearchParams();
  if (index > 0) params.set("i", String(index));
  if (version) params.set("v", version);
  const query = params.toString();
  return `/annonsebilde/${encodeURIComponent(id)}${query ? `?${query}` : ""}`;
}

export function isInlineImage(src: string) {
  return src.startsWith("data:image/");
}

export function decodeDataImage(src: string): { type: string; bytes: Uint8Array } | null {
  const match = DATA_IMAGE.exec(src.trim());
  if (!match) return null;
  const type = match[1]?.toLowerCase() === "image/jpg" ? "image/jpeg" : match[1]?.toLowerCase();
  if (!type || !match[2]) return null;
  const binary = atob(match[2].replace(/\s/g, ""));
  if (binary.length > MAX_BYTES) return null;
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { type, bytes };
}

export function withPublicImages<T extends { id: string; image?: string; images?: string[] }>(artwork: T, version?: string): T {
  const sources = artwork.images?.length ? artwork.images : artwork.image ? [artwork.image] : [];
  if (!sources.some((src) => isInlineImage(src))) return artwork;
  const images = sources.map((src, index) => (isInlineImage(src) ? listingImagePath(artwork.id, index, version) : src));
  return { ...artwork, image: images[0] ?? artwork.image, images };
}
