import { z } from 'zod';

export interface NorwegianAddressSuggestion {
  id: string;
  label: string;
  line1: string;
  postalCode: string;
  city: string;
}

const kartverketAddressSchema = z.object({
  adresseid: z.union([z.string(), z.number()]).optional(),
  adressetekst: z.string(),
  adressetekstutenadressetilleggsnavn: z.string().nullish(),
  postnummer: z.string().nullish(),
  poststed: z.string().nullish(),
});

const kartverketResponseSchema = z.object({
  adresser: z.array(kartverketAddressSchema),
});

export function formatPostalPlace(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('nb-NO')
    .split(/(\s+|-)/)
    .map((part) => part.charAt(0).toLocaleUpperCase('nb-NO') + part.slice(1))
    .join('');
}

export function mapNorwegianAddresses(payload: unknown): NorwegianAddressSuggestion[] {
  const parsed = kartverketResponseSchema.safeParse(payload);
  if (!parsed.success) return [];

  const seen = new Set<string>();
  const suggestions: NorwegianAddressSuggestion[] = [];
  for (const address of parsed.data.adresser) {
    const line1 = (address.adressetekstutenadressetilleggsnavn ?? address.adressetekst).trim();
    const postalCode = address.postnummer?.trim() ?? '';
    const city = address.poststed?.trim() ?? '';
    if (line1.length < 3 || !/^\d{4}$/.test(postalCode) || city.length < 2) continue;
    const id = String(address.adresseid ?? `${line1}-${postalCode}`);
    if (seen.has(id)) continue;
    seen.add(id);
    suggestions.push({
      id,
      label: address.adressetekst.trim() || line1,
      line1,
      postalCode,
      city: formatPostalPlace(city),
    });
    if (suggestions.length === 8) break;
  }
  return suggestions;
}
