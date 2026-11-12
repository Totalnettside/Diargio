import { describe, expect, it } from 'vitest';
import { heroArtworks } from './hero-art';
import { artworks } from './demo';

describe('launch illustrations', () => {
  it('keeps exactly three fixed illustrations', () => {
    expect(heroArtworks.map((art) => art.title)).toEqual(['Speil i Nidelva', 'Blå resonans', 'Rød balanse']);
  });
  it('does not provide generated marketplace inventory', () => {
    expect(artworks).toEqual([]);
    expect(heroArtworks.every((art) => art.sellerId === '' && art.slug === '' && art.price === 0)).toBe(true);
  });
});