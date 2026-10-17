import art1 from "@/assets/art-1.jpg";
import art2 from "@/assets/art-2.jpg";
import art3 from "@/assets/art-3.jpg";
import art4 from "@/assets/art-4.jpg";
import art5 from "@/assets/art-5.jpg";
import art6 from "@/assets/art-6.jpg";
import art7 from "@/assets/art-7.jpg";
import art8 from "@/assets/art-8.jpg";
import artist1 from "@/assets/artist-1.jpg";
import artist2 from "@/assets/artist-2.jpg";
import artist3 from "@/assets/artist-3.jpg";

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

const _demoArtists: Artist[] = [
  {
    id: "a1",
    slug: "astrid-berg",
    name: "Astrid Berg",
    nationality: "Norsk",
    born: "1978",
    movement: "Samtidsmaleri",
    bio: "Astrid Berg arbeider med havet som motiv, i store lag av olje på lerret. Hun er utdannet ved Kunsthøgskolen i Bergen og stiller jevnlig ut i Norge og Danmark.",
    avatar: artist1,
  },
  {
    id: "a2",
    slug: "henrik-dahl",
    name: "Henrik Dahl",
    nationality: "Norsk",
    born: "1984",
    movement: "Dokumentarfotografi",
    bio: "Henrik Dahl fotograferer norsk natur i sort/hvitt, alltid analogt og alltid håndkopiert i eget mørkerom.",
    avatar: artist2,
  },
  {
    id: "a3",
    slug: "nora-kvam",
    name: "Nora Kvam",
    nationality: "Norsk",
    born: "1969",
    movement: "Skulptur",
    bio: "Nora Kvam lager abstrakte bronseskulpturer med utgangspunkt i kroppens bevegelse.",
    avatar: artist3,
  },
  {
    id: "a4",
    slug: "lars-foss",
    name: "Lars Foss",
    nationality: "Norsk",
    born: "1955",
    movement: "Figurativt maleri",
    bio: "Lars Foss maler portretter og interiører i en varm, jordnær palett.",
    avatar: artist2,
  },
  {
    id: "a5",
    slug: "maja-lind",
    name: "Maja Lind",
    nationality: "Svensk",
    born: "1990",
    movement: "Minimalisme",
    bio: "Maja Lind arbeider med stillhet, flate og lys i dempede fargefelt.",
    avatar: artist1,
  },
  {
    id: "a6",
    slug: "pushwagner",
    name: "Pushwagner",
    nationality: "Norsk",
    born: "1940–2018",
    movement: "Pop art",
    bio: "Terje Brofos, kjent som Pushwagner, er en av Norges mest kjente popkunstnere.",
    avatar: artist3,
  },
  {
    id: "a7",
    slug: "ingrid-solberg",
    name: "Ingrid Solberg",
    nationality: "Norsk",
    born: "1982",
    movement: "Abstrakt ekspresjonisme",
    bio: "Ingrid Solberg maler store, fargesterke lerret med rust- og okertoner.",
    avatar: artist1,
  },
  {
    id: "a8",
    slug: "tobias-rud",
    name: "Tobias Rud",
    nationality: "Norsk",
    born: "1993",
    movement: "Street art",
    bio: "Tobias Rud jobber med sjablong og spray, fra vegg til lerret.",
    avatar: artist2,
  },
  {
    id: "a9",
    slug: "sofie-halvorsen",
    name: "Sofie Halvorsen",
    nationality: "Norsk",
    born: "1975",
    movement: "Tegning",
    bio: "Sofie Halvorsen tegner figurstudier i blyant og kull på håndlaget papir.",
    avatar: artist1,
  },
  {
    id: "a10",
    slug: "jonas-eide",
    name: "Jonas Eide",
    nationality: "Norsk",
    born: "1988",
    movement: "Digital kunst",
    bio: "Jonas Eide lager generative digitale verk som trykkes i små opplag.",
    avatar: artist2,
  },
];

const _demoSellers: Seller[] = [
  {
    id: "s1",
    slug: "kevin",
    name: "Kevin Aleksandersen",
    type: "Privat",
    verified: true,
    rating: 4.9,
    reviewCount: 23,
    sales: 7,
    memberSince: "2026",
    responseRate: 98,
    location: "Oslo",
    avatar: artist2,
    followers: 42,
  },
  {
    id: "s2",
    slug: "ola-nordmann",
    name: "Ola Nordmann",
    type: "Privat",
    verified: true,
    rating: 4.8,
    reviewCount: 14,
    sales: 5,
    memberSince: "2025",
    responseRate: 92,
    location: "Bergen",
    avatar: artist3,
    followers: 18,
  },
  {
    id: "s3",
    slug: "astrid-berg-atelier",
    name: "Astrid Berg",
    type: "Kunstner",
    verified: true,
    rating: 5,
    reviewCount: 31,
    sales: 22,
    memberSince: "2024",
    responseRate: 99,
    location: "Oslo",
    avatar: artist1,
    followers: 310,
  },
  {
    id: "s4",
    slug: "galleri-fineart",
    name: "Galleri Fineart",
    type: "Galleri",
    verified: true,
    rating: 4.9,
    reviewCount: 87,
    sales: 164,
    memberSince: "2024",
    responseRate: 96,
    location: "Oslo",
    avatar: artist3,
    about:
      "Galleri Fineart formidler norsk og internasjonal samtidskunst, med vekt på grafikk og maleri.",
    address: "Filipstad Brygge 2, 0252 Oslo",
    website: "galleri-fineart.no",
    followers: 1240,
  },
  {
    id: "s5",
    slug: "kunstverket-galleri",
    name: "Kunstverket Galleri",
    type: "Galleri",
    verified: true,
    rating: 4.7,
    reviewCount: 52,
    sales: 98,
    memberSince: "2025",
    responseRate: 90,
    location: "Bergen",
    avatar: artist1,
    about: "Bergensgalleri spesialisert på grafikk, litografi og silketrykk.",
    address: "Vaskerelven 8, 5014 Bergen",
    website: "kunstverket.no",
    followers: 640,
  },
  {
    id: "s6",
    slug: "nord-kunsthandel",
    name: "Nord Kunsthandel",
    type: "Kunsthandler",
    verified: true,
    rating: 4.6,
    reviewCount: 40,
    sales: 71,
    memberSince: "2025",
    responseRate: 88,
    location: "Trondheim",
    avatar: artist2,
    about: "Kunsthandel med fokus på etterkrigstidens norske malere.",
    followers: 233,
  },
  {
    id: "s7",
    slug: "marte-lie",
    name: "Marte Lie",
    type: "Privat",
    verified: false,
    rating: 4.5,
    reviewCount: 6,
    sales: 2,
    memberSince: "2026",
    responseRate: 80,
    location: "Stavanger",
    avatar: artist1,
    followers: 9,
  },
  {
    id: "s8",
    slug: "erik-sund",
    name: "Erik Sund",
    type: "Privat",
    verified: true,
    rating: 4.7,
    reviewCount: 11,
    sales: 4,
    memberSince: "2025",
    responseRate: 85,
    location: "Tromsø",
    avatar: artist2,
    followers: 15,
  },
  {
    id: "s9",
    slug: "atelier-kvam",
    name: "Nora Kvam",
    type: "Kunstner",
    verified: true,
    rating: 4.9,
    reviewCount: 19,
    sales: 12,
    memberSince: "2024",
    responseRate: 94,
    location: "Trondheim",
    avatar: artist3,
    followers: 187,
  },
  {
    id: "s10",
    slug: "hanne-vik",
    name: "Hanne Vik",
    type: "Privat",
    verified: false,
    rating: 4.4,
    reviewCount: 5,
    sales: 1,
    memberSince: "2026",
    responseRate: 76,
    location: "Lillehammer",
    avatar: artist1,
    followers: 4,
  },
  {
    id: "s11",
    slug: "galleri-soft-oslo",
    name: "Galleri Nordlys",
    type: "Galleri",
    verified: true,
    rating: 4.8,
    reviewCount: 33,
    sales: 61,
    memberSince: "2025",
    responseRate: 93,
    location: "Kristiansand",
    avatar: artist3,
    about: "Galleri for unge norske kunstnere og street art.",
    address: "Markens gate 12, 4610 Kristiansand",
    website: "gallerinordlys.no",
    followers: 402,
  },
];

const titles = [
  "Uendelig hav",
  "Fjordlys",
  "Stillhet nr. 4",
  "At Sea",
  "Varmsolen",
  "Nordvest",
  "Portrett i oker",
  "Bevegelse III",
  "Vinterhav",
  "Bylandskap",
  "Rustfjell",
  "Sommernatt",
  "Fjelllys",
  "Skygger på papir",
  "Sjøstykke",
  "Oslo nord",
  "Blå time",
  "Bronsefigur",
  "Gatens språk",
  "Digital drift",
  "Stille morgen",
  "Havbrus",
  "Studie i grått",
  "Kystlinje",
  "Rødt felt",
  "Nattmaleri",
  "Papirfugl",
  "Formstudie",
  "Sprayvegg",
  "Generativ nr. 7",
];

const prices = [
  2500, 7900, 14000, 28000, 55000, 120000, 4900, 18500, 32000, 85000, 9500, 6400, 23000,
  41000, 3200, 67000, 15900, 27500, 5600, 99000, 12500, 8900, 36000, 4200, 74000, 19000,
  3900, 52000, 11000, 145000,
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]!;
}

const _demoArtworks: Artwork[] = titles.map((title, i) => {
  const artist = pick(_demoArtists, i * 3 + 1);
  const seller = pick(_demoSellers, i * 5 + 2);
  const saleType: SaleType =
    i % 9 === 4 ? "Auksjon" : i % 5 === 3 ? "Bud ønskes" : i % 11 === 7 ? "Pris på forespørsel" : "Fastpris";
  const price = prices[i]!;
  const slug = `${title
    .toLowerCase()
    .replace(/[^a-z0-9æøå ]/g, "")
    .trim()
    .replace(/\s+/g, "-")}-${1000 + i}`;
  return {
    id: `w${i + 1}`,
    slug,
    title,
    artistId: artist.id,
    sellerId: seller.id,
    category: pick(categories, i * 3),
    style: pick(styles, i * 7),
    technique: pick(techniques, i * 5),
    type: pick(artTypes, i * 2),
    condition: pick(conditions, i),
    year: 1968 + ((i * 7) % 57),
    widthCm: 30 + ((i * 13) % 110),
    heightCm: 40 + ((i * 17) % 120),
    ...(i % 3 === 0 ? { edition: `${(i % 40) + 5}/150` } : {}),
    signed: i % 4 !== 0,
    framed: i % 3 !== 1,
    coa: i % 2 === 0,
    provenance:
      i % 2 === 0
        ? "Kjøpt direkte fra kunstneren, dokumentasjon følger verket."
        : "Privat samling, Oslo. Erhvervet på galleri i 2014.",
    location: seller.location,
    county: pick(counties, i * 2),
    saleType,
    price,
    ...(saleType === "Auksjon"
      ? {
          currentBid: Math.round(price * 0.5),
          bidCount: 4 + (i % 14),
          auctionEndsInMin: 134 + i * 37,
          minIncrement: 500,
        }
      : {}),
    image: pick(artImages, i),
    views: 120 + i * 43,
    favorites: 3 + (i % 27),
    verified: i % 3 !== 2,
    createdDaysAgo: i,
    description: `${title} er et ${pick(techniques, i * 5).toLowerCase()}verk av ${artist.name}. Verket måler ${30 + ((i * 13) % 110)} × ${40 + ((i * 17) % 120)} cm og selges av ${seller.name} i ${seller.location}.`,
    delivery: i % 3 === 0 ? "Kan sendes" : i % 3 === 1 ? "Må hentes" : "Begge deler",
  };
});

void _demoArtworks;
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
const _demoReviews: DemoReview[] = [
  {
    id: "r1",
    author: "Marte L.",
    rating: 5,
    text: "Rask og profesjonell handel. Verket var akkurat som beskrevet.",
    date: "12. juli 2026",
  },
  {
    id: "r2",
    author: "Jonas E.",
    rating: 5,
    text: "God innpakning og hyggelig kommunikasjon hele veien.",
    date: "3. juni 2026",
  },
  {
    id: "r3",
    author: "Hanne V.",
    rating: 4,
    text: "Fin opplevelse, litt treg levering, men verket var flott.",
    date: "21. mai 2026",
  },
];

void _demoReviews;
