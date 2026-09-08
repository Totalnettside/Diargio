import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { completeVippsLogin } from "@/lib/vipps.functions";

export const Route = createFileRoute("/auth/vipps")({
  head: () => ({
    meta: [
      { title: "Fullfører Vipps-innlogging – Geargio" },
      { name: "description", content: "Vi fullfører innloggingen din med Vipps og BankID." },
      { property: "og:title", content: "Fullfører Vipps-innlogging – Geargio" },
      { property: "og:description", content: "Vi fullfører innloggingen din med Vipps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VippsReturn,
});

function VippsReturn() {
  const [msg, setMsg] = useState("Fullfører innlogging med Vipps …");
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const expected = sessionStorage.getItem("vipps_state");
    sessionStorage.removeItem("vipps_state");

    if (!code || !state || state !== expected) {
      setMsg("Innloggingen ble avbrutt. Prøv igjen.");
      return;
    }

    void (async () => {
      try {
        const { tokenHash, email } = await completeVippsLogin({
          data: { code, redirectUri: `${window.location.origin}/auth/vipps` },
        });
        const { error } = await supabase.auth.verifyOtp({
          type: "email",
          token_hash: tokenHash,
          email,
        });
        if (error) throw error;
        void navigate({ to: "/min-side" });
      } catch (err) {
        setMsg(err instanceof Error ? err.message : "Vipps-innlogging feilet.");
      }
    })();
  }, [navigate]);

  return (
    <main className="mx-auto w-full max-w-md px-4 py-16 text-center">
      <p className="text-sm text-ink/70">{msg}</p>
    </main>
  );
}
