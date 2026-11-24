import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { bringPackageSchema, type BringQuote } from './bring';
import { fetchBringQuote } from './bring.server';

export const getBringQuote = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ listingId: z.string().min(1).max(200), toPostalCode: z.string().regex(/^\d{4}$/) }).parse(input))
  .handler(async ({ data, context }): Promise<{ quote: BringQuote } | { error: string }> => {
    try {
      const { data: listing, error } = await context.supabase.from('listings').select('data').eq('id', data.listingId).eq('moderation_status', 'published').single();
      if (error || !listing) throw new Error('Annonsen er utilgjengelig.');
      const artwork = listing.data as Record<string, unknown>;
      if (artwork['shippingMethod'] !== 'bring' || artwork['delivery'] === 'Må hentes') throw new Error('Annonsen tilbyr ikke Bring-frakt.');
      const parcel = bringPackageSchema.safeParse(artwork['shippingPackage']);
      if (!parcel.success) throw new Error('Selger må fylle inn pakket vekt, mål og postnummer før frakt kan beregnes.');
      return { quote: await fetchBringQuote(parcel.data, data.toPostalCode) };
    } catch (e) { return { error: e instanceof Error ? e.message : 'Kunne ikke beregne frakt.' }; }
  });