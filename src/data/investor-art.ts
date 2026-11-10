import type { Artwork } from '@/data/demo';
import art01 from '@/assets/investor-art-01.webp';
import art02 from '@/assets/investor-art-02.webp';
import art03 from '@/assets/investor-art-03.webp';
import art04 from '@/assets/investor-art-04.webp';
import art05 from '@/assets/investor-art-05.webp';
import art06 from '@/assets/investor-art-06.webp';
import art07 from '@/assets/investor-art-07.webp';
import art08 from '@/assets/investor-art-08.webp';
import art09 from '@/assets/investor-art-09.webp';
import art10 from '@/assets/investor-art-10.webp';

const examples = [
  { title: 'Blå resonans', image: art01, price: 12000, widthCm: 60, heightCm: 80, category: 'Malerier' },
  { title: 'Fjordlys', image: art02, price: 8500, widthCm: 80, heightCm: 60, category: 'Malerier' },
  { title: 'Rød balanse', image: art03, price: 6500, widthCm: 60, heightCm: 80, category: 'Malerier' },
  { title: 'Speil i Nidelva', image: art04, price: 3500, widthCm: 80, heightCm: 60, category: 'Fotografi' },
  { title: 'Botanisk stillhet', image: art05, price: 7200, widthCm: 60, heightCm: 80, category: 'Malerier' },
  { title: 'Nordlige høyder', image: art06, price: 9800, widthCm: 80, heightCm: 60, category: 'Malerier' },
  { title: 'Roser i bevegelse', image: art07, price: 11000, widthCm: 60, heightCm: 80, category: 'Malerier' },
  { title: 'Blå kanne', image: art08, price: 5400, widthCm: 60, heightCm: 80, category: 'Malerier' },
  { title: 'Kystens linjer', image: art09, price: 4200, widthCm: 60, heightCm: 80, category: 'Tegninger' },
  { title: 'Åpent hav', image: art10, price: 8900, widthCm: 80, heightCm: 60, category: 'Malerier' },
];

// Presentation-only: never merge these into persistent listings or commerce state.
export const investorArtworks: Artwork[] = examples.map((example, index) => ({
  ...example, id: `investor-demo-${index + 1}`, slug: `investor-demo-${index + 1}`,
  artistId: '', artistName: 'Demoverk · AI-generert', sellerId: '', style: '',
  technique: 'Illustrasjon', type: 'Demoverk', condition: '', year: 2026,
  signed: false, framed: false, coa: false, provenance: '', location: 'Trondheim',
  county: 'Trøndelag', saleType: 'Fastpris', views: 0, favorites: 0, verified: false,
  createdDaysAgo: 0, description: 'AI-generert demobilde for investorvisning. Ikke et ekte kunstverk eller en salgsannonse.', delivery: '',
}));