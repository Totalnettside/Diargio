import { describe, expect, it } from 'vitest';
import { avatarLayout } from './avatar-layout';
describe('profile photo framing', () => {
  it('fits a full wide logo without stretching', () => {
    const frame = avatarLayout(800, 400, 1, 0, 0);
    expect(frame).toEqual({ width: 320, height: 160, x: 0, y: 80 });
  });
  it('preserves zoom and dragged placement in saved coordinates', () => {
    expect(avatarLayout(400, 400, 2, 17, -12)).toEqual({ width: 640, height: 640, x: -143, y: -172 });
  });
});