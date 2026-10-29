import { describe, expect, it } from 'vitest';
import { emptyWall, wallLayoutSchema } from './visual-art';

describe('Art wall room and color persistence', () => {
  it('preserves a hallway when serializing a saved wall', () => {
    const wall = { ...emptyWall(), scene: 'hallway' };
    expect(wallLayoutSchema.parse(JSON.parse(JSON.stringify(wall))).scene).toBe('hallway');
  });
  it('preserves a selected custom wall color', () => {
    const wall = { ...emptyWall(), color: '#679ac4' };
    expect(wallLayoutSchema.parse(JSON.parse(JSON.stringify(wall))).color).toBe('#679ac4');
  });
  it('rejects unsafe custom color values', () => {
    expect(wallLayoutSchema.safeParse({ ...emptyWall(), color: 'url(https://example.com)' }).success).toBe(false);
  });
  it('keeps existing preset walls compatible', () => {
    expect(wallLayoutSchema.parse({ ...emptyWall(), color: 'sage' }).color).toBe('sage');
  });
});