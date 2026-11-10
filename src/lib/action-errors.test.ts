import {it,expect} from 'vitest';
import {actionError} from './action-errors';
it('does not expose database errors',()=>expect(actionError(new Error('relation public.secret missing'))).toBe('Handlingen kunne ikke gjennomføres. Prøv igjen.'));
it('explains active trade deletion blocks',()=>expect(actionError(new Error('Listing has an active order'))).toBe('Annonsen er knyttet til en pågående handel. Handelen må avklares før annonsen kan slettes.'));
it('explains expired sessions',()=>expect(actionError(new Error('Unauthorized'))).toBe('Økten din har utløpt. Logg inn på nytt.'));
it('explains permission denial',()=>expect(actionError(new Error('Forbidden'))).toBe('Du har ikke tilgang til å endre eller slette dette innholdet.'));