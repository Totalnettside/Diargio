import { z } from 'zod';
export const environmentSchema = z.enum(['sandbox', 'live']);
export function minorUnits(value: number): number {
  if (!Number.isFinite(value) || value < 0 || value > 1000000000) throw new Error('Ugyldig beløp');
  return Math.round(value * 100);
}
export function checkoutAmounts(listingTotal: number, shipping: number) {
  const artwork = minorUnits(listingTotal);
  if (!artwork) throw new Error('Verket mangler gyldig pris');
  const freight = minorUnits(shipping);
  return { artwork, shipping: freight, total: artwork + freight };
}
export function safeDestination(value: unknown) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && !value.startsWith('/auth') ? value : '/min-side';
}
export const orderLabels: Record<string, string> = { reserved:'Reservert', pending:'Venter på betaling', paid:'Betalt · venter på levering', shipped:'Sendt / klar for henting', approved:'Mottak godkjent · oppgjør avventer', disputed:'Tvist · admin behandler', refund_pending:'Refusjon behandles', refunded:'Refundert', expired:'Reservasjon utløpt', failed:'Betaling mislyktes', payout_pending:'Oppgjør avventer', paid_out:'Utbetalt' };
