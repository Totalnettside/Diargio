import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {actionError} from './action-errors';

type Ctx = { supabase: { rpc: (...a: never[]) => unknown }; userId: string };
async function assertAdmin(context: unknown) {
  const c = context as Ctx & { supabase: any };
  const { data } = await c.supabase.rpc("has_role", { _user_id: c.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const a = await assertAdmin(context);
    const [profiles, listings, bids, purchases, messages, follows, reviews, roles, authUsers, orders, pending] = await Promise.all([
      a.from("profiles").select("id,display_name,first_name,last_name,avatar_url,location,phone,created_at,onboarded,bankid_verified"),
      a.from("listings").select("id,user_id,data,created_at,moderation_status,deleted_at,blocked"),
      a.from("bids").select("id,listing_id,buyer_id,seller_id,amount,status,created_at"),
      a.from("purchases").select("id,listing_id,buyer_id,seller_id,created_at"),
      a.from("messages").select("id,created_at").order("created_at", { ascending: false }).limit(1000),
      a.from("artist_follows").select("artist_id,created_at"),
      a.from("reviews").select("seller_id,rating,created_at"),
      a.from("user_roles").select("user_id,role").eq("role", "admin"),
      a.auth.admin.listUsers({ perPage: 1000 }),
      a.from("art_orders").select("*").eq("environment","live"),
      a.from('listing_revisions').select('id',{count:'exact',head:true}).eq('status','pending'),
    ]);
    if([profiles,listings,bids,purchases,messages,follows,reviews,roles,orders].some(r=>r.error)||authUsers.error)throw new Error("Kontrollsenteret kunne ikke hente alle opplysninger");
    const authMap = new Map(
      (authUsers.data?.users ?? []).map((u) => [u.id, { email: u.email ?? null, last_sign_in_at: u.last_sign_in_at ?? null, provider: (u.app_metadata?.provider as string) ?? "email" }]),
    );
    const listingRows = (listings.data ?? []).map((l) => {
      const d = (l.data ?? {}) as { title?: string; price?: number; images?: string[]; image?: string; slug?: string; category?: string; technique?: string };
      return {
        id: l.id,
        user_id: l.user_id,
        created_at: l.created_at,
        status:l.moderation_status,deletedAt:l.deleted_at,blocked:l.blocked,
        content:l.data,
        title: String(d.title ?? "Uten tittel"),
        price: Number(d.price ?? 0) || 0,
        image: (Array.isArray(d.images) ? (d.images[0] as string) : (d.image as string)) ?? null,
        slug: String(d.slug ?? l.id),
        category: String(d.category ?? d.technique ?? ""),
      };
    });
    const [restrictions,history]=await Promise.all([context.supabase.from('profile_restrictions').select('*'),context.supabase.from('administrative_actions').select('id,actor_id,target_type,target_id,action,reason,internal_note,created_at').order('created_at',{ascending:false}).limit(200)]);
    if(restrictions.error||history.error)throw new Error('Administrasjonshistorikken kunne ikke hentes.');
    return {
      history:history.data??[],
      users: (profiles.data ?? []).map((p) => ({ ...p, blocked:restrictions.data?.find(r=>r.user_id===p.id)?.blocked??false, ...(authMap.get(p.id) ?? { email: null, last_sign_in_at: null, provider: "email" }) })),
      listings: listingRows,
      bids: bids.data ?? [],
      purchases: purchases.data ?? [],
      orders: orders.data ?? [],
      messageTimes: (messages.data ?? []).map((m) => m.created_at),
      follows: follows.data ?? [],
      reviews: reviews.data ?? [],
      adminIds: (roles.data ?? []).map((r) => r.user_id),
      pendingListings:pending.count??0,
    };
  });

export const restrictProfile=createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
 .inputValidator(d=>z.object({userId:z.string().uuid(),blocked:z.boolean(),reason:z.string().max(4000),note:z.string().max(4000).optional()}).parse(d))
 .handler(async({data,context})=>{const {error}=await context.supabase.rpc('manage_profile_restriction',{_user:data.userId,_blocked:data.blocked,_reason:data.reason,_note:data.note??''});if(error){console.error('Profile restriction failed',error);throw new Error(actionError(new Error(error.message),'Profilen kunne ikke endres.'));}return {ok:true};});

export const adminEditListing=createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
 .inputValidator(d=>z.object({id:z.string().min(1),title:z.string().trim().min(1).max(200).optional(),removeImage:z.number().int().nonnegative().optional(),reason:z.string().max(4000).optional()}).parse(d))
 .handler(async({data,context})=>{await assertAdmin(context);const {data:row,error}=await context.supabase.from('listings').select('data').eq('id',data.id).single();if(error||!row)throw new Error('Annonsen kunne ikke hentes.');const content=row.data as Record<string,any>;let next={...content};if(data.title)next['title']=data.title;if(data.removeImage!==undefined){const {removeListingImage}=await import('./listing-images');next={...next,...removeListingImage(Array.isArray(content['images'])&&content['images'].length?content['images']:[content['image']],data.removeImage)};}const {error:saveError}=await context.supabase.rpc('admin_save_listing_revision',{_id:data.id,_data:next as never,_reason:data.reason??'',_note:''});if(saveError){console.error('Admin listing edit failed',saveError);throw new Error(actionError(new Error(saveError.message),'Annonsen kunne ikke lagres.'));}return {ok:true};});

export const adminEditProfile=createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
 .inputValidator(d=>z.object({userId:z.string().uuid(),displayName:z.string().trim().min(1).max(200),reason:z.string().max(4000).optional()}).parse(d))
 .handler(async({data,context})=>{const a=await assertAdmin(context);const {data:before,error:readError}=await a.from('profiles').select('display_name').eq('id',data.userId).single();if(readError)throw new Error('Profilen kunne ikke hentes.');const {error}=await a.from('profiles').update({display_name:data.displayName}).eq('id',data.userId);if(error)throw new Error('Profilen kunne ikke lagres.');const {error:historyError}=await a.from('administrative_actions').insert({actor_id:context.userId,target_type:'profile',target_id:data.userId,action:'edit',reason:data.reason??null,before_data:before,after_data:{display_name:data.displayName}});if(historyError)throw new Error('Profilen er lagret, men historikken kunne ikke registreres.');return {ok:true};});

export const setAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), admin: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const a = await assertAdmin(context);
    if (data.userId === context.userId && !data.admin) throw new Error("Du kan ikke fjerne din egen admin-tilgang");
    const result = data.admin ? await a.from("user_roles").upsert({ user_id: data.userId, role: "admin" }, { onConflict: "user_id,role" }) : await a.from("user_roles").delete().eq("user_id", data.userId).eq("role", "admin");
    if(result.error) throw new Error("Admin-tilgang kunne ikke lagres");
    return { ok: true };
  });

export const setVerified = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), verified: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const a = await assertAdmin(context);
    if(data.verified) throw new Error("BankID-verifisering er ikke integrert ennå.");
    const {error}=await a.from("profiles").update({ bankid_verified: false }).eq("id", data.userId);
    if(error)throw new Error("Kunne ikke lagre endringen");
    return { ok: true };
  });
