import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function purgeUser(uid: string) {
  const { supabaseAdmin: a } = await import("@/integrations/supabase/client.server");
  const [orders,purchases,conversations,bids,listings,accounts]=await Promise.all([
    a.from('art_orders').select('id').or(`buyer_id.eq.${uid},seller_id.eq.${uid}`).limit(1),
    a.from('purchases').select('id').or(`buyer_id.eq.${uid},seller_id.eq.${uid}`).limit(1),
    a.from('conversations').select('id').or(`buyer_id.eq.${uid},seller_id.eq.${uid}`).limit(1),
    a.from('bids').select('id').or(`buyer_id.eq.${uid},seller_id.eq.${uid}`).limit(1),
    a.from('listings').select('id').eq('user_id',uid).limit(1),
    a.from('artist_payment_accounts').select('user_id').eq('user_id',uid).limit(1),
  ]);
  if([orders,purchases,conversations,bids,listings,accounts].some(r=>r.error))throw new Error('Historikken kunne ikke kontrolleres. Ingen sletting utført.');
  if(orders.data?.length||purchases.data?.length||conversations.data?.length||bids.data?.length||listings.data?.length||accounts.data?.length)throw new Error('Kontoen har handel eller samtalehistorikk, annonser eller betalingsdokumentasjon som må bevares. Sletting krever separat personvernbehandling.');
  for(const bucket of ['avatars','art-wall-rooms']){
    const {data:objects,error}=await a.storage.from(bucket).list(uid,{limit:1000});
    if(error)throw new Error('Kunne ikke kontrollere private bilder.');
    if(objects?.length){const {error:removeError}=await a.storage.from(bucket).remove(objects.map(o=>`${uid}/${o.name}`));if(removeError)throw new Error('Private bilder kunne ikke slettes.');}
  }
  const walls=await a.from('art_walls').delete().eq('user_id',uid);if(walls.error)throw new Error('Kunstvegger kunne ikke slettes.');
  const library=await a.from('account_library').delete().eq('user_id',uid);if(library.error)throw new Error('Kontoens samlinger kunne ikke slettes.');
  const follows=await a.from('artist_follows').delete().or(`follower_id.eq.${uid},artist_id.eq.${uid}`);if(follows.error)throw new Error('Følgerdata kunne ikke slettes.');
  const restriction=await a.from('profile_restrictions').delete().eq('user_id',uid);if(restriction.error)throw new Error('Profilstatusen kunne ikke fjernes.');
  const {error}=await a.auth.admin.deleteUser(uid);if(error)throw new Error('Kontoen kunne ikke slettes. Kontakt admin.');
}

export const deleteOwnAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    throw new Error("Selvbetjent sletting er ikke tilgjengelig. Kontakt post@diargio.com.");
    return { ok: true };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(),reason:z.string().trim().min(1).max(4000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    if (data.userId === context.userId) throw new Error("Du kan ikke slette deg selv her");
    await purgeUser(data.userId);
    const {supabaseAdmin:a}=await import('@/integrations/supabase/client.server');
    await a.from('administrative_actions').insert({actor_id:context.userId,target_type:'profile',target_id:data.userId,action:'delete',reason:data.reason});
    return { ok: true };
  });
