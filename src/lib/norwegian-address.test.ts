import { describe, expect, it } from 'vitest';
import { formatPostalPlace, mapNorwegianAddresses } from './norwegian-address';

describe('Norwegian address suggestions', () => {
  it('fills the full Prinsessevegen address from Kartverket', () => {
    const result = mapNorwegianAddresses({
      adresser: [{
        adresseid: '276401752',
        adressetekst: 'Prinsessevegen 1A',
        adressetekstutenadressetilleggsnavn: 'Prinsessevegen 1A',
        postnummer: '7053',
        poststed: 'CHARLOTTENLUND',
      }],
    });
    expect(result).toEqual([{
      id: '276401752',
      label: 'Prinsessevegen 1A',
      line1: 'Prinsessevegen 1A',
      postalCode: '7053',
      city: 'Charlottenlund',
    }]);
  });

  it('keeps Norwegian postal-place capitalization readable', () => {
    expect(formatPostalPlace('BØ I TELEMARK')).toBe('Bø I Telemark');
  });

  it('does not suggest an incomplete delivery address', () => {
    expect(mapNorwegianAddresses({ adresser: [{ adressetekst: 'Ukjent vei 1', postnummer: '123', poststed: 'OSLO' }] })).toEqual([]);
  });
});
