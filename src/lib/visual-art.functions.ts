import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { wallLayoutSchema, exhibitionRoomSchema } from './visual-art';
import type { Artwork } from '@/data/demo';
import { withPublicImages } from '@/lib/listing-image-url';
import type { Json } from '@/integrations/supabase/types';

export const getVisualArt = createServerFn({ method: 'GET' }).handler(async () => {
  const { publicArtClient } = await import('./visual-art-public.server');
  const c = publicArtClient();
  const [listings, exhibitions, unavailable] = await Promise.all([
    c.from('listings').select('id,user_id,data:catalog_data,updated_at').eq('moderation_status','published').order('created_at', { ascending: false }),
    c.from('art_exhibitions').select('id,title,rooms,published').eq('published', true).order('created_at'),
    c.rpc('unavailable_artwork_ids'),
  ]);
  if (listings.error || exhibitions.error || unavailable.error) throw new Error('Kunsten kunne ikke lastes. Prøv igjen.');
  const sold = new Set(unavailable.data ?? []);
  const artworks = (listings.data ?? []).flatMap((l) => {
    const a = l.data as unknown as Artwork & { status?: string; available?: boolean; sold?: boolean };
    if (!a.image || sold.has(l.id) || a.sold || a.available === false || ['sold', 'Solgt', 'unavailable', 'archived'].includes(a.status ?? '')) return [];
    return [withPublicImages({ ...a, id: l.id, sellerId: l.user_id }, l.updated_at)];
  });
  return { artworks, exhibitions: (exhibitions.data ?? []).map((e) => ({ ...e, rooms: z.array(exhibitionRoomSchema).catch([]).parse(e.rooms) })) };
});

export const getSharedWall = createServerFn({ method: 'GET' })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { publicArtClient } = await import('./visual-art-public.server');
    const c = publicArtClient();
    const { data: wall, error } = await c.from('art_walls').select('id,name,layout').eq('id', data.id).eq('shared', true).maybeSingle();
    if (error || !wall) return null;
    const layout = wallLayoutSchema.parse(wall.layout);
    const roomUrl = layout.roomPath ? `/api/public/shared-wall-image/${wall.id}` : undefined;
    return { id: wall.id, name: wall.name, layout: { ...layout, roomPath: undefined }, roomUrl };
  });

export const saveArtWall = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid().optional(), name: z.string().trim().min(1).max(100), shared: z.boolean(), layout: wallLayoutSchema }).parse(d))
  .handler(async ({ context, data }) => {
    if (data.layout.roomPath && (!data.layout.roomPath.startsWith(`${context.userId}/`) || data.layout.roomPath.includes('..'))) throw new Error('Romfotoet tilhører ikke denne kontoen.');
    const row = { name: data.name, shared: data.shared, layout: data.layout as unknown as Json, updated_at: new Date().toISOString() };
    const query = data.id
      ? context.supabase.from('art_walls').update(row).eq('id', data.id).eq('user_id', context.userId)
      : context.supabase.from('art_walls').insert({ ...row, user_id: context.userId });
    const { data: wall, error } = await query.select('id').single();
    if (error) throw new Error('Kunstveggen kunne ikke lagres.');
    return wall.id;
  });

export const saveExhibition = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid().optional(), title: z.string().trim().min(1).max(120), published: z.boolean(), rooms: z.array(exhibitionRoomSchema).min(1).max(20) }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: admin } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (!admin) throw new Error('Ingen tilgang.');
    const row = { title: data.title, published: data.published, rooms: data.rooms as unknown as Json, updated_at: new Date().toISOString() };
    const query = data.id ? context.supabase.from('art_exhibitions').update(row).eq('id', data.id) : context.supabase.from('art_exhibitions').insert(row);
    const { data: e, error } = await query.select('id').single();
    if (error) throw new Error('Utstillingen kunne ikke lagres.');
    return e.id;
  });