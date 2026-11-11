import { describe, expect, it } from 'vitest';
import { GALLERY_ROOMS, GALLERY_WALL_BOTTOM, fitGalleryArt } from './gallery-rooms';

describe('Gallery wall placement', () => {
  it('keeps every artwork fully on the wall, including extreme image ratios', () => {
    for (const room of GALLERY_ROOMS) {
      for (const slot of room.slots) {
        for (const ratio of [0.05, 0.5, 1, 2, 20]) {
          const art = fitGalleryArt(slot, ratio, 'test-artwork');
          const bottom = art.y + art.width * (1600 / 912) / art.ratio;
          expect(art.y).toBeGreaterThanOrEqual(0);
          expect(bottom).toBeLessThanOrEqual(GALLERY_WALL_BOTTOM);
        }
      }
    }
  });

  it('keeps all four positions separated horizontally', () => {
    for (const room of GALLERY_ROOMS) {
      const centers = room.slots.map((slot) => slot.cx);
      expect(new Set(centers).size).toBe(4);
      for (const slot of room.slots) {
        expect(slot.cx - slot.w / 2).toBeGreaterThanOrEqual(0);
        expect(slot.cx + slot.w / 2).toBeLessThanOrEqual(1);
      }
    }
  });
});
