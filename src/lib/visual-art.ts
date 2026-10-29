import { z } from 'zod';
import living from '@/assets/wall-living.jpg';
import dining from '@/assets/wall-dining.jpg';
import gallery from '@/assets/gallery-room.jpg';
import hallway from '@/assets/wall-hallway.jpg';

export const roomScenes = [
  { id: 'living', name: 'Lys stue', image: living },
  { id: 'dining', name: 'Spisestue', image: dining },
  { id: 'gallery', name: 'Galleri', image: gallery },
];
export const wallRoomScenes = [
  ...roomScenes,
  { id: 'hallway', name: 'Lang gang', image: hallway },
];
export const wallColors = ['original', 'ivory', 'gray', 'sage', 'clay'] as const;
export const placementSchema = z.object({
  id: z.string().min(1).max(100), artworkId: z.string().min(1).max(200),
  x: z.number().min(0).max(1), y: z.number().min(0).max(1),
  width: z.number().min(0.02).max(0.9), ratio: z.number().min(0.05).max(20),
});
export const wallLayoutSchema = z.object({
  scene: z.enum(['living', 'dining', 'gallery', 'hallway']).default('living'),
  roomPath: z.string().max(300).optional(),
  aspect: z.number().min(0.2).max(5).default(1.5),
  color: z.union([z.enum(wallColors), z.string().regex(/^#[0-9a-f]{6}$/i)]).default('original'),
  calibration: z.object({ start: z.number().min(0).max(1), end: z.number().min(0).max(1), cm: z.number().min(1).max(10000) }).nullable().default(null),
  placements: z.array(placementSchema).max(30).default([]),
});
export const exhibitionRoomSchema = z.object({
  id: z.string().min(1).max(100), name: z.string().trim().min(1).max(100),
  scene: z.enum(['living', 'dining', 'gallery']),
  placements: z.array(placementSchema).max(30),
});
export type Placement = z.infer<typeof placementSchema>;
export type WallLayout = z.infer<typeof wallLayoutSchema>;
export type ExhibitionRoom = z.infer<typeof exhibitionRoomSchema>;
export type Exhibition = { id: string; title: string; published: boolean; rooms: ExhibitionRoom[] };
export const emptyWall = (): WallLayout => ({ scene: 'living', aspect: 1.5, color: 'original', calibration: null, placements: [] });
export function sceneImage(id: string) { return wallRoomScenes.find((r) => r.id === id)?.image ?? living; }
export function newPlacement(artworkId: string, ratio: number, index: number): Placement {
  return { id: crypto.randomUUID(), artworkId, ratio: Math.max(0.05, Math.min(20, ratio || 1)), width: 0.18, x: 0.15 + (index % 3) * 0.24, y: 0.18 + (Math.floor(index / 3) % 2) * 0.2 };
}
export function visualHead(title: string, description: string) {
  return { meta: [{ title: `${title} | Diargio` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} | Diargio` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] };
}