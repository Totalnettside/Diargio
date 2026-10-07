import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const notifySeller = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ kind: z.enum(["bid", "sale"]), listingId: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    try {
      let sellerId: string | undefined, eventId: string | undefined, amount: number | undefined;
      if (data.kind === "bid") {
        const { data: b } = await supabase.from("bids").select("id,seller_id,amount").eq("buyer_id", userId).eq("listing_id", data.listingId).order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (!b) return { sent: false };
        sellerId = b.seller_id; eventId = b.id; amount = Number(b.amount);
      } else {
        const { data: p } = await supabase.from("purchases").select("id,seller_id").eq("buyer_id", userId).eq("listing_id", data.listingId).maybeSingle();
        if (!p) return { sent: false };
        sellerId = p.seller_id; eventId = p.id;
      }
      const { data: l } = await supabase.from("listings").select("data").eq("id", data.listingId).maybeSingle();
      const ld = (l?.data ?? {}) as { title?: string; price?: number };
      if (data.kind === "sale" && ld.price) amount = Number(ld.price);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(sellerId!);
      const email = u?.user?.email;
      if (!email) return { sent: false };
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      const r = await sendTemplateEmail("seller-notice", email, {
        templateData: { kind: data.kind, title: ld.title, amount: amount ? amount.toLocaleString("nb-NO") : undefined },
        idempotencyKey: `seller-${data.kind}-${eventId}`,
      });
      return { sent: r.sent };
    } catch (e) {
      console.error("seller notice failed", e);
      return { sent: false };
    }
  });
