import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const startBankIdVerification = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ returnTo: z.string().max(300).default('/min-side') }).parse(d))
  .handler(async ({ data, context }) => {
    try {
      const { getRequest } = await import('@tanstack/react-start/server');
      const reqOrigin = new URL(getRequest().url).origin;
      const origin = reqOrigin.startsWith('http://') && !reqOrigin.includes('localhost') ? reqOrigin.replace('http://', 'https://') : reqOrigin;
      const { buildAuthorizeUrl } = await import('./bankid.server');
      return { url: await buildAuthorizeUrl(context.userId, origin, data.returnTo) };
    } catch (e) {
      console.error(e);
      return { error: 'BankID er ikke tilgjengelig akkurat nå.' };
    }
  });

export const getBankIdStatus = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from('profiles').select('bankid_verified').eq('id', context.userId).maybeSingle();
    return { verified: data?.bankid_verified === true };
  });
