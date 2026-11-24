import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/bankid/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = url.origin.startsWith('http://') && !url.hostname.includes('localhost') ? url.origin.replace('http://', 'https://') : url.origin;
        const back = (path: string, status: string) => Response.redirect(`${origin}${path}${path.includes('?') ? '&' : '?'}bankid=${status}`, 302);
        const { verifyState, exchangeCode } = await import('@/lib/bankid.server');
        const state = await verifyState(url.searchParams.get('state') ?? '').catch(() => null);
        if (!state) return back('/min-side', 'feil');
        const code = url.searchParams.get('code');
        if (!code) return back(state.r, 'avbrutt');
        const claims = await exchangeCode(code, origin).catch(() => null);
        if (!claims) return back(state.r, 'feil');
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const { error } = await supabaseAdmin.from('profiles').update({ bankid_verified: true }).eq('id', state.u);
        if (error) { console.error('bankid profile update', error); return back(state.r, 'feil'); }
        return back(state.r, 'ok');
      },
    },
  },
});
