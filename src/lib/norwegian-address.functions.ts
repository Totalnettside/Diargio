import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { mapNorwegianAddresses } from './norwegian-address';

const addressSearchSchema = z.object({
  query: z.string().trim().min(2).max(100),
});

export const searchNorwegianAddresses = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => addressSearchSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const params = new URLSearchParams({
        sok: data.query,
        treffPerSide: '12',
        side: '0',
        asciiKompatibel: 'true',
      });
      const response = await fetch(`https://ws.geonorge.no/adresser/v1/sok?${params}`, {
        headers: { Accept: 'application/json' },
        redirect: 'manual',
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) return { addresses: [], error: 'Adresseoppslaget er midlertidig utilgjengelig.' };
      return { addresses: mapNorwegianAddresses(await response.json()) };
    } catch {
      return { addresses: [], error: 'Adresseoppslaget er midlertidig utilgjengelig.' };
    }
  });
