import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const sendWelcomeEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;
    const email = (claims as { email?: string }).email;
    if (!email) return { sent: false };
    const { data } = await supabase.from("profiles").select("first_name").eq("id", userId).maybeSingle();
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    try {
      const r = await sendTemplateEmail("welcome", email, {
        templateData: { name: data?.first_name ?? undefined },
        idempotencyKey: `welcome-${userId}`,
      });
      return { sent: r.sent };
    } catch (e) {
      console.error("welcome email failed", e);
      return { sent: false };
    }
  });
