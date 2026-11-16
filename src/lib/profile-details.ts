import { z } from 'zod';

export const profileTypes = ['artist', 'gallery', 'private'] as const;
export type ProfileType = typeof profileTypes[number];
export const profileTypeLabels: Record<ProfileType, string> = {
  artist: 'Kunstner', gallery: 'Galleri / kunstforhandler', private: 'Privatperson',
};
export const profileDetailsSchema = z.object({
  profile_type: z.enum(profileTypes),
  organization_number: z.string().trim().max(9).refine(v => !v || /^\d{9}$/.test(v), 'Organisasjonsnummer må ha ni sifre'),
  visiting_address: z.string().trim().max(300),
  opening_hours: z.string().trim().max(500),
  social_media: z.string().trim().max(1000),
  art_interests: z.string().trim().max(1000),
});

export function profileFieldVisibility(type: ProfileType) {
  return { artist: type === 'artist', gallery: type === 'gallery', interests: type === 'private' };
}