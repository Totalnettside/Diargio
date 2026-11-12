import art1 from "@/assets/art-1.webp";
import art2 from "@/assets/art-2.webp";
import art3 from "@/assets/art-3.webp";
import art4 from "@/assets/art-4.webp";
import art5 from "@/assets/art-5.webp";
import art6 from "@/assets/art-6.webp";
import art7 from "@/assets/art-7.webp";
import art8 from "@/assets/art-8.webp";
import artist1 from "@/assets/artist-1.webp";
import artist2 from "@/assets/artist-2.webp";
import artist3 from "@/assets/artist-3.webp";

export const artImages = [art1, art2, art3, art4, art5, art6, art7, art8];
export const portraits = [artist1, artist2, artist3];

export type SellerType = "Privat" | "Kunstner" | "Galleri" | "Kunsthandler";
export type SaleType = "Fastpris" | "Bud ønskes" | "Auksjon" | "Pris på forespørsel";

export type Artist = {
  id: string;
  slug: string;
  name: string;
  nationality: string;
  born: string;
  movement: string;
  bio: string;
  avatar: string;
};

export type Seller = {
  id: string;
  slug: string;
  name: string;
  type: SellerType;
  verified: boolean;
  rating: number;
  reviewCount: number;
  sales: number;
  memberSince: string;
  responseRate: number;
  location: string;
  avatar: string;
  about?: string;
  address?: string;
  website?: string;
  followers: number;
};

export type Artwork = {
  id: string;
  slug: string;
  title: string;
  artistId: string;
  artistName?: string;
  sellerId: string;
  category: string;
  style: string;
  technique: string;
  type: string;
  condition: string;
  year: number;
  widthCm: number;
  heightCm: number;
  edition?: string;
  signed: boolean;
  framed: boolean;
  coa: boolean;
  provenance: string;
  location: string;
  county: string;
  saleType: SaleType;
  price: number;
  sellerPayout?: number;
  shippingPrice?: number;
  artFeeApplies?: boolean;
  currentBid?: number;
  bidCount?: number;
  auctionEndsInMin?: number;
  minIncrement?: number;
  image: string;
  images?: string[];
  sellerType?: SellerType;
  ownWork?: boolean;
  moderationStatus?: string;
  sellerMessage?: string | null;
  revisionId?: string;
  revisionVersion?: number;
  views: number;
  favorites: number;
  verified: boolean;
  createdDaysAgo: number;
  description: string;
  delivery: string;
};

export const categories = [
  "Malerier",
  "Grafikk & trykk",
  "Fotografi",
  "Skulpturer",
  "Tegninger",
  "Street art",
  "Digital kunst",
  "Samleobjekter",
];

export const styles = [
  "Abstrakt",
  "Moderne",
  "Figurativ",
  "Pop art",
  "Minimalistisk",
  "Street art",
  "Klassisk",
  "Contemporary",
  "Natur",
  "Portrett",
];

export const techniques = [
  "Olje",
  "Akryl",
  "Akvarell",
  "Litografi",
  "Silketrykk",
  "Foto",
  "Mixed media",
  "Blyant",
  "Digital",
  "Pappmaché",
  "Skulptur",
  "Collage",
  "Keramikk",
];

export const artTypes = [
  "Original",
  "Limited edition",
  "Signert trykk",
  "Nummerert",
  "Reproduksjon",
];

export const conditions = ["Ny", "Som ny", "God", "Brukt"];
export const sellerTypes: SellerType[] = ["Privat", "Kunstner", "Galleri", "Kunsthandler"];
export const saleTypes: SaleType[] = [
  "Fastpris",
  "Bud ønskes",
  "Auksjon",
  "Pris på forespørsel",
];
export const counties = [
  "Østfold",
  "Akershus",
  "Oslo",
  "Innlandet",
  "Buskerud",
  "Vestfold",
  "Telemark",
  "Agder",
  "Rogaland",
  "Vestland",
  "Møre og Romsdal",
  "Trøndelag",
  "Nordland",
  "Troms",
  "Finnmark",
];

export const artists: Artist[] = [];
export const sellers: Seller[] = [];
export const artworks: Artwork[] = [];
export const featuredArtworks = artworks.filter((a) => a.verified).slice(0, 6);

const unknownArtist: Artist = { id: "self", slug: "", name: "Ukjent kunstner", nationality: "", born: "", movement: "", bio: "", avatar: "" };
const selfSeller: Seller = { id: "s1", slug: "", name: "Deg", type: "Privat", verified: false, rating: 0, reviewCount: 0, sales: 0, memberSince: "2026", responseRate: 0, location: "Norge", avatar: "", followers: 0 };
export function artistById(id: string): Artist {
  return artists.find((a) => a.id === id) ?? unknownArtist;
}
export function artistFor(a: { artistId: string; artistName?: string }): Artist {
  const base = artistById(a.artistId);
  return a.artistName && !base.slug ? { ...base, name: a.artistName } : base;
}
export function sellerById(id: string): Seller {
  return sellers.find((s) => s.id === id) ?? selfSeller;
}
export function artworkBySlug(slug: string) {
  return artworks.find((a) => a.slug === slug);
}
export function artistBySlug(slug: string) {
  return artists.find((a) => a.slug === slug);
}
export function sellerBySlug(slug: string) {
  return sellers.find((s) => s.slug === slug);
}
export function artworksByArtist(artistId: string) {
  return artworks.filter((a) => a.artistId === artistId);
}
export function artworksBySeller(sellerId: string) {
  return artworks.filter((a) => a.sellerId === sellerId);
}

export function formatPrice(value: number) {
  return `${value.toLocaleString("nb-NO").replace(/\u00A0/g, " ")} kr`;
}

export function countdown(minutes: number) {
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  return d > 0 ? `${d}d ${h}t ${m}m` : `${h}t ${m}m`;
}

export type DemoReview = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
};

export const reviews: DemoReview[] = [];
