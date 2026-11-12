import { describe, expect, it } from 'vitest';
import { GALLERY_ROOMS, GALLERY_WALL_BOTTOM, fitGalleryArt, galleryPreviewPrice } from './gallery-rooms';

describe('Gallery room pricing', () => {
  it('starts room 1 at 399 kr for seven days', () => {
    expect(galleryPreviewPrice(1, 7)).toBe(399);
  });
  it.each([
    [1, 399, 699, 1099],
    [2, 249, 449, 749],
    [3, 149, 249, 399],
  ])('uses the same room %i prices regardless of slot tier', (room, week, fortnight, month) => {
    expect([7, 14, 30].map(days => galleryPreviewPrice(room, days as 7 | 14 | 30))).toEqual([week, fortnight, month]);
  });
  it('charges more for longer periods in every room', () => {
    for (const room of [1, 2, 3]) {
      expect(galleryPreviewPrice(room, 14)).toBeGreaterThan(galleryPreviewPrice(room, 7));
      expect(galleryPreviewPrice(room, 30)).toBeGreaterThan(galleryPreviewPrice(room, 14));
    }
  });
  it('charges less in rooms further back for every period', () => {
    for (const days of [7, 14, 30] as const) {
      expect(galleryPreviewPrice(1, days)).toBeGreaterThan(galleryPreviewPrice(2, days));
      expect(galleryPreviewPrice(2, days)).toBeGreaterThan(galleryPreviewPrice(3, days));
    }
  });
});

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
