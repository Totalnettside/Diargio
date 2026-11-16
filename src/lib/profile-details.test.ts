import { describe, expect, it } from 'vitest';
import { profileDetailsSchema, profileFieldVisibility } from './profile-details';

describe('profile fields', () => {
  it('shows art story and techniques only for artists', () => {
    expect(profileFieldVisibility('artist').artist).toBe(true);
    expect(profileFieldVisibility('gallery').artist).toBe(false);
    expect(profileFieldVisibility('private').artist).toBe(false);
  });
  it('shows gallery fields only for galleries and dealers', () => {
    expect(profileFieldVisibility('gallery').gallery).toBe(true);
    expect(profileFieldVisibility('artist').gallery).toBe(false);
    expect(profileFieldVisibility('private').gallery).toBe(false);
  });
  it('shows optional art interests for private individuals', () => {
    expect(profileFieldVisibility('private').interests).toBe(true);
    expect(profileFieldVisibility('artist').interests).toBe(false);
    expect(profileFieldVisibility('gallery').interests).toBe(false);
  });
  it('accepts all three profile types without granting permissions', () => {
    for (const profile_type of ['artist', 'gallery', 'private']) {
      expect(profileDetailsSchema.safeParse({ profile_type, organization_number: '', visiting_address: '', opening_hours: '', social_media: '', art_interests: '' }).success).toBe(true);
    }
    expect(profileDetailsSchema.safeParse({ profile_type: 'admin' }).success).toBe(false);
  });
});