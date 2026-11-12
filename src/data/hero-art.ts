import type { Artwork } from '@/data/demo';
import nidelva from '@/assets/investor-art-04.webp';
import blue from '@/assets/investor-art-01.webp';
import red from '@/assets/investor-art-03.webp';

// Fixed decorative illustrations, never inventory or commerce records.
export const heroArtworks: Artwork[] = [
  { title: 'Speil i Nidelva', image: nidelva },
  { title: 'Blå resonans', image: blue },
  { title: 'Rød balanse', image: red },
].map((art, index) => ({
  ...art, id: `hero-illustration-${index + 1}`, slug: '', artistId: '', sellerId: '',
  category: '', style: '', technique: 'Illustrasjon', type: 'Illustrasjon', condition: '',
  year: 2026, widthCm: 0, heightCm: 0, signed: false, framed: false, coa: false,
  provenance: '', location: '', county: '', saleType: 'Fastpris', price: 0,
  views: 0, favorites: 0, verified: false, createdDaysAgo: 0,
  description: 'AI-generert illustrasjon. Ikke til salgs.', delivery: '',
}));