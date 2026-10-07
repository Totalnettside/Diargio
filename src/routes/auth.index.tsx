import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { startVippsLogin } from "@/lib/vipps.functions";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { title: "Logg inn – Diargio" },
      {
        name: "description",
        content:
          "Logg inn på Diargio med e-post, Google eller Vipps (BankID) for å kjøpe og selge kunst.",
      },
      { property: "og:title", content: "Logg inn – Diargio" },
      {
        property: "og:description",
        content: "Logg inn med e-post, Google eller Vipps (BankID) på Diargio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"inn" | "ny">("inn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) void navigate({ to: "/min-side" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "inn") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Sjekk e-posten din for å bekrefte kontoen.");
    }
    setBusy(false);
  };

  const google = async () => {
    setMsg(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) setMsg("Google-innlogging feilet.");
  };

  const vipps = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const state = crypto.randomUUID();
      sessionStorage.setItem("vipps_state", state);
      const { authorizationUrl, error } = await startVippsLogin({
        data: { redirectUri: `${window.location.origin}/auth/vipps`, state },
      });
      if (!authorizationUrl) {
        setMsg(error ?? "Vipps-innlogging feilet.");
        setBusy(false);
        return;
      }
      window.location.href = authorizationUrl;
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Vipps-innlogging feilet.");
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10 pb-28 md:pb-12">
      <div className="rounded-3xl bg-white/70 p-6 glass">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {mode === "inn" ? "Logg inn" : "Opprett konto"}
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Kjøp, selg og følg kunst på Diargio.
        </p>

        <div className="mt-6 space-y-2">
          <button
            onClick={vipps}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff5b24] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            Fortsett med Vipps (BankID)
          </button>
          <button
            onClick={google}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink glass"
          >
            Fortsett med Google
          </button>
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-ink/45">
          <span className="h-px flex-1 bg-ink/10" /> eller e-post <span className="h-px flex-1 bg-ink/10" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-post"
            className="w-full rounded-2xl bg-white/80 px-4 py-3 text-sm outline-none glass"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passord"
            className="w-full rounded-2xl bg-white/80 px-4 py-3 text-sm outline-none glass"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {mode === "inn" ? "Logg inn" : "Opprett konto"}
          </button>
        </form>

        {msg && <p className="mt-4 text-sm text-brandink">{msg}</p>}

        <button
          onClick={() => setMode(mode === "inn" ? "ny" : "inn")}
          className="mt-5 w-full rounded-2xl border-2 border-sage px-4 py-3 text-sm font-semibold text-sage transition hover:bg-sage hover:text-white"
        >
          {mode === "inn" ? "Ny her? Opprett konto" : "Har du konto? Logg inn"}
        </button>

        <p className="mt-6 text-xs text-ink/50">
          Ved å fortsette godtar du Diargios vilkår.{" "}
          <Link to="/" className="underline">
            Til forsiden
          </Link>
        </p>
      </div>
    </main>
  );
}
