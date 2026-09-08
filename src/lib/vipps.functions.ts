import { createServerFn } from "@tanstack/react-start";

type Discovery = {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
};

function vippsBase() {
  return process.env["VIPPS_ENV"] === "production"
    ? "https://api.vipps.no"
    : "https://apitest.vipps.no";
}

async function discovery(): Promise<Discovery> {
  const res = await fetch(
    `${vippsBase()}/access-management-1.0/access/.well-known/openid-configuration`,
  );
  if (!res.ok) throw new Error("Fikk ikke kontakt med Vipps.");
  return (await res.json()) as Discovery;
}

export const startVippsLogin = createServerFn({ method: "POST" })
  .inputValidator((input: { redirectUri: string; state: string }) => input)
  .handler(async ({ data }) => {
    const clientId = process.env["VIPPS_CLIENT_ID"];
    if (!clientId)
      return {
        authorizationUrl: null,
        error: "Vipps er ikke koblet til ennå. Bruk e-post eller Google.",
      };
    const { authorization_endpoint } = await discovery();
    const url = new URL(authorization_endpoint);
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid name email phoneNumber");
    url.searchParams.set("redirect_uri", data.redirectUri);
    url.searchParams.set("state", data.state);
    return { authorizationUrl: url.toString(), error: null };
  });


export const completeVippsLogin = createServerFn({ method: "POST" })
  .inputValidator((input: { code: string; redirectUri: string }) => input)
  .handler(async ({ data }) => {
    const clientId = process.env["VIPPS_CLIENT_ID"];
    const clientSecret = process.env["VIPPS_CLIENT_SECRET"];
    if (!clientId || !clientSecret) throw new Error("Vipps er ikke konfigurert ennå.");

    const { token_endpoint, userinfo_endpoint } = await discovery();
    const tokenRes = await fetch(token_endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: data.code,
        redirect_uri: data.redirectUri,
      }),
    });
    if (!tokenRes.ok) throw new Error(`Vipps-innlogging feilet: ${await tokenRes.text()}`);
    const token = (await tokenRes.json()) as { access_token: string };

    const infoRes = await fetch(userinfo_endpoint, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    if (!infoRes.ok) throw new Error("Fikk ikke hentet profil fra Vipps.");
    const info = (await infoRes.json()) as {
      sub: string;
      email?: string;
      name?: string;
      phone_number?: string;
    };
    if (!info.email) throw new Error("Vipps ga ingen e-postadresse.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("vipps_sub", info.sub)
      .maybeSingle();

    let userId = existing?.id ?? null;
    if (!userId) {
      const created = await supabaseAdmin.auth.admin.createUser({
        email: info.email,
        email_confirm: true,
        user_metadata: { full_name: info.name ?? null },
      });
      if (created.data.user) {
        userId = created.data.user.id;
      } else {
        const { data: byEmail } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .limit(1)
          .maybeSingle();
        if (!byEmail) throw new Error(created.error?.message ?? "Kunne ikke opprette bruker.");
        userId = byEmail.id;
      }
    }

    if (userId) {
      await supabaseAdmin
        .from("profiles")
        .update({
          bankid_verified: true,
          vipps_sub: info.sub,
          ...(info.name ? { display_name: info.name } : {}),
          ...(info.phone_number ? { phone: info.phone_number } : {}),
        })
        .eq("id", userId);
    }

    const link = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: info.email,
    });
    const hashed = link.data.properties?.hashed_token;
    if (!hashed) throw new Error(link.error?.message ?? "Kunne ikke starte økten.");

    return { tokenHash: hashed, email: info.email };
  });
