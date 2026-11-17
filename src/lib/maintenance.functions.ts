import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { publicArtClient } from './visual-art-public.server';

export const getMaintenanceStatus = createServerFn({ method: 'GET' }).handler(async () => {
  const { data, error } = await publicArtClient().from('site_maintenance').select('enabled').eq('id', true).maybeSingle();
  if (error) return { enabled: true };
  return { enabled: data?.enabled ?? false };
});

export const getMaintenanceAdmin = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  return { admin: !error && data === true };
});

export const setMaintenanceMode = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({ enabled: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: enabled, error } = await context.supabase.rpc('set_site_maintenance', { _enabled: data.enabled });
    if (error) throw new Error('Vedlikeholdsmodus kunne ikke endres. Bare administratorer har tilgang.');
    return { enabled: enabled === true };
  });
