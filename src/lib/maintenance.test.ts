import { describe, expect, it } from 'vitest';
import { maintenanceShowsSite } from './maintenance';
describe('maintenance access', () => {
  it('hides home and direct artwork links from ordinary visitors', () => {
    for (const path of ['/', '/kunst/verk', '/min-side', '/diargioadmin007', '/ordre']) expect(maintenanceShowsSite(true, false, path)).toBe(false);
  });
  it('allows server-verified administrators to keep using all pages', () => {
    expect(maintenanceShowsSite(true, true, '/diargioadmin007')).toBe(true);
    expect(maintenanceShowsSite(true, true, '/kunst/verk')).toBe(true);
  });
  it('keeps the existing sign-in path without a secret URL bypass', () => {
    expect(maintenanceShowsSite(true, false, '/auth')).toBe(true);
    expect(maintenanceShowsSite(true, false, '/auth/anything')).toBe(false);
  });
  it('restores normal pages when switched off', () => {
    expect(maintenanceShowsSite(false, false, '/kunst/verk')).toBe(true);
  });
});