import { describe, expect, it } from 'vitest';
import { rotationGeometry } from './image-edit';

describe('image rotation', () => {
  it('swaps dimensions on a quarter turn', () => {
    expect(rotationGeometry(800, 600, 1)).toEqual({ width: 600, height: 800, radians: Math.PI / 2 });
  });
  it('restores original dimensions and orientation after four turns', () => {
    expect(rotationGeometry(800, 600, 4)).toEqual({ width: 800, height: 600, radians: 0 });
  });
  it('supports counterclockwise rotation', () => {
    expect(rotationGeometry(800, 600, -1)).toEqual({ width: 600, height: 800, radians: Math.PI * 1.5 });
  });
});