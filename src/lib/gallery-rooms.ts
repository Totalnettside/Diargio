import galleryWall from '@/assets/gallery-flat-wall.webp';
import type { Placement } from './visual-art';

export const GALLERY_ASPECT = 1600 / 912;
export const WALL_CATEGORIES = new Set(['Malerier', 'Grafikk & trykk', 'Fotografi', 'Tegninger', 'Street art', 'Digital kunst']);
export type GalleryTier = 'standard' | 'prominent' | 'entrance';
export type GallerySlot = { id: string; cx: number; cy: number; w: number; h: number; tier: GalleryTier };
export const GALLERY_TIERS: Record<GalleryTier, string> = { standard: 'Standard veggplass', prominent: 'Fremtredende veggplass', entrance: 'Hovedplass ved inngangen' };
export const GALLERY_PREVIEW_PRICES: Record<GalleryTier, Record<7 | 14 | 30, number>> = {
  standard: { 7: 299, 14: 499, 30: 799 },
  prominent: { 7: 499, 14: 799, 30: 1299 },
  entrance: { 7: 799, 14: 1299, 30: 1999 },
};
// The photograph's baseboard starts at 72%; keep every artwork above 70%.
export const GALLERY_WALL_BOTTOM = 0.7;

export const GALLERY_ROOMS = [
  { name: 'Nye perspektiver', text: 'Fire verk på én lys, åpen gallerivegg.', image: galleryWall, slots: [
    { id: '1-1', cx: .14, cy: .38, w: .18, h: .4, tier: 'entrance' },
    { id: '1-2', cx: .38, cy: .38, w: .18, h: .4, tier: 'prominent' },
    { id: '1-3', cx: .62, cy: .38, w: .18, h: .4, tier: 'standard' },
    { id: '1-4', cx: .86, cy: .38, w: .18, h: .4, tier: 'standard' },
  ] },
  { name: 'Stille rom', text: 'En rolig vegg med fire ledige kunstplasser.', image: galleryWall, slots: [
    { id: '2-1', cx: .14, cy: .38, w: .18, h: .4, tier: 'prominent' },
    { id: '2-2', cx: .38, cy: .38, w: .18, h: .4, tier: 'prominent' },
    { id: '2-3', cx: .62, cy: .38, w: .18, h: .4, tier: 'standard' },
    { id: '2-4', cx: .86, cy: .38, w: .18, h: .4, tier: 'entrance' },
  ] },
  { name: 'Den lange gangen', text: 'Gå videre og oppdag fire nye veggplasser.', image: galleryWall, slots: [
    { id: '3-1', cx: .14, cy: .38, w: .18, h: .4, tier: 'entrance' },
    { id: '3-2', cx: .38, cy: .38, w: .18, h: .4, tier: 'prominent' },
    { id: '3-3', cx: .62, cy: .38, w: .18, h: .4, tier: 'standard' },
    { id: '3-4', cx: .86, cy: .38, w: .18, h: .4, tier: 'standard' },
  ] },
] satisfies { name: string; text: string; image: string; slots: GallerySlot[] }[];

export function fitGalleryArt(slot: GallerySlot, ratio: number, artworkId: string): Placement {
  const r = ratio > 0 ? ratio : 1;
  let width = slot.w;
  let height = width * GALLERY_ASPECT / r;
  if (height > slot.h) { height = slot.h; width = height * r / GALLERY_ASPECT; }
  return { id: slot.id, artworkId, ratio: r, width, x: slot.cx - width / 2, y: slot.cy - height / 2 };
}