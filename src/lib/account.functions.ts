import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function purgeUser(uid: string) {
  const { supabaseAdmin: a } = await import("@/integrations/supabase/client.server");
  const { data: convs } = await a.from("conversations").select("id").or(`buyer_id.eq.${uid},seller_id.eq.${uid}`);
  const ids = (convs ?? []).map((c) => c.id);
  await a.from("bids").delete().or(`buyer_id.eq.${uid},seller_id.eq.${uid}`);
  if (ids.length) {
    await a.from("bids").delete().in("conversation_id", ids);
    await a.from("messages").delete().in("conversation_id", ids);
    await a.from("conversations").delete().in("id", ids);
  }
  await a.from("reviews").delete().or(`reviewer_id.eq.${uid},seller_id.eq.${uid}`);
  await a.from("purchases").delete().or(`buyer_id.eq.${uid},seller_id.eq.${uid}`);
  await a.from("artist_follows").delete().or(`follower_id.eq.${uid},artist_id.eq.${uid}`);
  await a.from("listings").delete().eq("user_id", uid);
  await a.from("profiles").delete().eq("id", uid);
  const { error } = await a.auth.admin.deleteUser(uid);
  if (error) throw new Error("Kunne ikke slette brukeren");
}

export const deleteOwnAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await purgeUser(context.userId);
    return { ok: true };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    if (data.userId === context.userId) throw new Error("Du kan ikke slette deg selv her");
    await purgeUser(data.userId);
    return { ok: true };
  });
