import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { wallLayoutSchema } from '@/lib/visual-art';

export const Route = createFileRoute('/api/public/shared-wall-image/$wallId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const parsed = z.string().uuid().safeParse(params.wallId);
        if (!parsed.success) return new Response('Not found', { status: 404 });
        const { publicArtClient } = await import('@/lib/visual-art-public.server');
        const { data: wall } = await publicArtClient().from('art_walls').select('id,layout').eq('id', parsed.data).eq('shared', true).maybeSingle();
        if (!wall) return new Response('Not found', { status: 404 });
        const layout = wallLayoutSchema.safeParse(wall.layout);
        if (!layout.success || !layout.data.roomPath) return new Response('Not found', { status: 404 });
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const { data: file, error } = await supabaseAdmin.storage.from('art-wall-rooms').download(layout.data.roomPath);
        if (error || !file || !file.type.startsWith('image/')) return new Response('Not found', { status: 404 });
        return new Response(await file.arrayBuffer(), {
          headers: {
            'Content-Type': file.type,
            'Cache-Control': 'private, no-store, max-age=0',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      },
    },
  },
});
