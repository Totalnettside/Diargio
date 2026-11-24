import { describe, expect, it } from 'vitest';
import { bringPackageSchema, bringRequest, parseBringQuote } from './bring';
const parcel = { weightKg: 2.5, lengthCm: 80, widthCm: 60, heightCm: 10, fromPostalCode: '7010' };
describe('Bring weight-based shipping', () => {
  it('sends 2.5 kg as 2500 grams and preserves packed dimensions', () => {
    expect(bringRequest(parcel, '0150').consignments[0]?.packages[0]).toEqual({ id: '1', grossWeight: 2500, length: 80, width: 60, height: 10 });
    expect(bringRequest({ ...parcel, weightKg: 5 }, '0150').consignments[0]?.packages[0]?.grossWeight).toBe(5000);
  });
  it('rejects zero weight and missing sender postal code', () => {
    expect(bringPackageSchema.safeParse({ ...parcel, weightKg: 0 }).success).toBe(false);
    expect(bringPackageSchema.safeParse({ ...parcel, fromPostalCode: '' }).success).toBe(false);
  });
  it('uses the actual Bring price including VAT in minor units without adding art fees', () => {
    const price = { currencyCode: 'NOK', priceWithAdditionalServices: { amountWithVAT: '323.46' } };
    const result = parseBringQuote({ consignments: [{ products: [{ id: '5800', price: { netPrice: price, listPrice: { ...price, priceWithAdditionalServices: { amountWithVAT: '400.00' } } } }] }] }, '0150');
    expect(result.amount).toBe(32346);
    expect(result.toPostalCode).toBe('0150');
  });
  it('never treats unavailable shipping as free', () => {
    expect(() => parseBringQuote({ consignments: [{ products: [] }] }, '0150')).toThrow();
  });
});