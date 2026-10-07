import hall1 from '@/assets/gallery-hall-1.jpg';
import hall2 from '@/assets/gallery-hall-2.jpg';
import hall3 from '@/assets/gallery-hall-3.jpg';
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
export const GALLERY_ROOMS = [
  { name: 'Nye perspektiver', text: 'Lyse vegger og naturlig lys.', image: hall1, slots: [
    { id: '1-1', cx: .36, cy: .33, w: .2, h: .3, tier: 'entrance' },
    { id: '1-2', cx: .87, cy: .33, w: .12, h: .32, tier: 'prominent' },
    { id: '1-3', cx: .6, cy: .37, w: .07, h: .12, tier: 'standard' },
    { id: '1-4', cx: .18, cy: .3, w: .05, h: .2, tier: 'standard' },
  ] },
  { name: 'Stille rom', text: 'Et rolig rom under takvinduet.', image: hall2, slots: [
    { id: '2-1', cx: .36, cy: .36, w: .15, h: .26, tier: 'prominent' },
    { id: '2-2', cx: .64, cy: .36, w: .15, h: .26, tier: 'prominent' },
    { id: '2-3', cx: .12, cy: .33, w: .13, h: .3, tier: 'standard' },
    { id: '2-4', cx: .88, cy: .33, w: .13, h: .3, tier: 'entrance' },
  ] },
  { name: 'Den lange gangen', text: 'Gå videre innover og oppdag flere verk.', image: hall3, slots: [
    { id: '3-1', cx: .14, cy: .33, w: .16, h: .32, tier: 'entrance' },
    { id: '3-2', cx: .87, cy: .33, w: .15, h: .32, tier: 'prominent' },
    { id: '3-3', cx: .44, cy: .34, w: .08, h: .18, tier: 'standard' },
    { id: '3-4', cx: .7, cy: .35, w: .05, h: .12, tier: 'standard' },
  ] },
] satisfies { name: string; text: string; image: string; slots: GallerySlot[] }[];

export function fitGalleryArt(slot: GallerySlot, ratio: number, artworkId: string): Placement {
  const r = ratio > 0 ? ratio : 1;
  let width = slot.w;
  let height = width * GALLERY_ASPECT / r;
  if (height > slot.h) { height = slot.h; width = height * r / GALLERY_ASPECT; }
  return { id: slot.id, artworkId, ratio: r, width, x: slot.cx - width / 2, y: slot.cy - height / 2 };
}