import { expect, it } from 'vitest';
import { serializeTechniques, toggleTechnique } from './listing-techniques';

it('keeps multiple checked techniques in the saved listing value', () => {
  expect(serializeTechniques(toggleTechnique(['Olje'], 'Akryl'))).toBe('Olje, Akryl');
});
it('unchecks one technique without clearing other selections', () => {
  expect(toggleTechnique(['Olje', 'Akryl', 'Collage'], 'Akryl')).toEqual(['Olje', 'Collage']);
});