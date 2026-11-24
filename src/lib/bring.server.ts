import { bringRequest, parseBringQuote, type BringPackage } from './bring';

export async function fetchBringQuote(parcel: BringPackage, toPostalCode: string) {
  const key = process.env['BRING_API_KEY'];
  const uid = process.env['BRING_API_UID'];
  if (!key || !uid) throw new Error('Bring-frakt er ikke tilgjengelig akkurat nå. Prøv igjen senere.');
  let response: Response;
  try {
    response = await fetch('https://api.bring.com/shippingguide/api/v2/products', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Mybring-API-Key': key, 'X-Mybring-API-Uid': uid },
      body: JSON.stringify(bringRequest(parcel, toPostalCode, process.env['BRING_CUSTOMER_NUMBER'])),
      signal: AbortSignal.timeout(15000), redirect: 'manual',
    });
  } catch { throw new Error('Bring svarer ikke akkurat nå. Prøv igjen.'); }
  if (!response.ok) throw new Error('Bring kunne ikke beregne frakten. Kontroller pakkeopplysningene eller prøv igjen senere.');
  return parseBringQuote(await response.json(), toPostalCode);
}