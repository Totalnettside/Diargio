import { z } from 'zod';

export const bringPackageSchema = z.object({
  weightKg: z.number().finite().positive().max(1000),
  lengthCm: z.number().finite().positive().max(1000),
  widthCm: z.number().finite().positive().max(1000),
  heightCm: z.number().finite().positive().max(1000),
  fromPostalCode: z.string().regex(/^\d{4}$/),
});
export type BringPackage = z.infer<typeof bringPackageSchema>;
export type BringQuote = { amount: number; productId: string; label: string; toPostalCode: string; quotedAt: string };
export function bringRequest(parcel: BringPackage, toPostalCode: string, customerNumber?: string) {
  const p = bringPackageSchema.parse(parcel);
  z.string().regex(/^\d{4}$/).parse(toPostalCode);
  return {
    consignments: [{ id: '1', fromCountryCode: 'NO', toCountryCode: 'NO', fromPostalCode: p.fromPostalCode, toPostalCode,
      packages: [{ id: '1', grossWeight: Math.ceil(p.weightKg * 1000), length: p.lengthCm, width: p.widthCm, height: p.heightCm }],
      products: [{ id: '5800', ...(customerNumber ? { customerNumber } : {}) }],
    }], withPrice: true, withGuiInformation: true, language: 'NO',
  };
}
const priceSchema = z.object({ currencyCode: z.literal('NOK'), priceWithAdditionalServices: z.object({ amountWithVAT: z.union([z.string(), z.number()]) }) });
const responseSchema = z.object({ consignments: z.array(z.object({ products: z.array(z.object({
  id: z.string(), errors: z.array(z.unknown()).optional(),
  price: z.object({ netPrice: priceSchema.optional(), listPrice: priceSchema.optional() }).optional(),
})) })) });
export function parseBringQuote(response: unknown, toPostalCode: string): BringQuote {
  const parsed = responseSchema.safeParse(response);
  const product = parsed.success ? parsed.data.consignments[0]?.products.find(p => p.id === '5800' && !p.errors?.length) : undefined;
  const price = product?.price?.netPrice ?? product?.price?.listPrice;
  const amount = Number(price?.priceWithAdditionalServices.amountWithVAT);
  if (!product || !price || !Number.isFinite(amount) || amount <= 0) throw new Error('Bring kan ikke beregne frakt for denne pakken. Avtal annen transport eller henting med selger.');
  return { amount: Math.round(amount * 100), productId: product.id, label: 'Bring · Pakke til hentested', toPostalCode, quotedAt: new Date().toISOString() };
}