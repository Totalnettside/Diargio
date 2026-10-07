import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
    const [profiles, listings, bids, purchases, messages, follows, reviews, roles, authUsers] = await Promise.all([
      a.from("profiles").select("id,display_name,first_name,last_name,avatar_url,location,phone,created_at,onboarded,bankid_verified"),
      a.from("listings").select("id,user_id,data,created_at"),
      a.from("bids").select("id,listing_id,buyer_id,seller_id,amount,status,created_at"),
      a.from("purchases").select("id,listing_id,buyer_id,seller_id,created_at"),
      a.from("messages").select("id,created_at").order("created_at", { ascending: false }).limit(1000),
      a.from("artist_follows").select("artist_id,created_at"),
      a.from("reviews").select("seller_id,rating,created_at"),
      a.from("user_roles").select("user_id,role").eq("role", "admin"),
      a.auth.admin.listUsers({ perPage: 1000 }),
    ]);
    const authMap = new Map(
      (authUsers.data?.users ?? []).map((u) => [u.id, { email: u.email ?? null, last_sign_in_at: u.last_sign_in_at ?? null, provider: (u.app_metadata?.provider as string) ?? "email" }]),
    );
    const listingRows = (listings.data ?? []).map((l) => {
      const d = (l.data ?? {}) as Record<string, unknown>;
      return {
        id: l.id,
        user_id: l.user_id,
        created_at: l.created_at,
        title: String(d.title ?? "Uten tittel"),
        price: Number(d.price ?? 0) || 0,
        image: (Array.isArray(d.images) ? (d.images[0] as string) : (d.image as string)) ?? null,
        slug: String(d.slug ?? l.id),
        category: String(d.category ?? d.technique ?? ""),
      };
    });
    return {
      users: (profiles.data ?? []).map((p) => ({ ...p, ...(authMap.get(p.id) ?? { email: null, last_sign_in_at: null, provider: "email" }) })),
      listings: listingRows,
      bids: bids.data ?? [],
      purchases: purchases.data ?? [],
      messageTimes: (messages.data ?? []).map((m) => m.created_at),
      follows: follows.data ?? [],
      reviews: reviews.data ?? [],
      adminIds: (roles.data ?? []).map((r) => r.user_id),
    };
  });

export const setAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), admin: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const a = await assertAdmin(context);
    if (data.userId === context.userId && !data.admin) throw new Error("Du kan ikke fjerne din egen admin-tilgang");
    if (data.admin) await a.from("user_roles").upsert({ user_id: data.userId, role: "admin" }, { onConflict: "user_id,role" });
    else await a.from("user_roles").delete().eq("user_id", data.userId).eq("role", "admin");
    return { ok: true };
  });

export const setVerified = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), verified: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const a = await assertAdmin(context);
    await a.from("profiles").update({ bankid_verified: data.verified }).eq("id", data.userId);
    return { ok: true };
  });
