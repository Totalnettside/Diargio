import { describe, expect, it } from 'vitest';
import { rotationGeometry } from './image-edit';

describe('image rotation', () => {
  it('swaps dimensions on a quarter turn', () => {
    expect(rotationGeometry(800, 600, 90)).toEqual({ width: 600, height: 800, radians: Math.PI / 2 });
  });
  it('restores original dimensions and orientation after four turns', () => {
    expect(rotationGeometry(800, 600, 360)).toEqual({ width: 800, height: 600, radians: 0 });
  });
  it('supports counterclockwise rotation', () => {
    expect(rotationGeometry(800, 600, -90)).toEqual({ width: 600, height: 800, radians: -Math.PI / 2 });
  });
  it.each([
    [2, 821, 628],
    [-5, 850, 668],
    [17, 941, 808],
  ])('retains the complete image at %s degrees', (degrees, width, height) => {
    expect(rotationGeometry(800, 600, degrees)).toEqual({ width, height, radians: degrees * Math.PI / 180 });
  });
  it('preserves fractional manual angles', () => {
    expect(rotationGeometry(800, 600, -5.25).radians).toBe(-5.25 * Math.PI / 180);
  });
});