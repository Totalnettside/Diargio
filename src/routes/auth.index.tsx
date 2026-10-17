import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import galleryRoom from "@/assets/gallery-hall-1.jpg";

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { title: "Logg inn – Diargio" },
      {
        name: "description",
        content:
          "Logg inn på Diargio med e-post eller Google for å kjøpe og selge kunst.",
      },
      { property: "og:title", content: "Logg inn – Diargio" },
      {
        property: "og:description",
        content: "Logg inn med e-post eller Google på Diargio.",
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
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <main className="auth-page">
      <section className="auth-gallery" aria-label="Diargios kunstrom">
        <img src={galleryRoom} alt="Et lyst gallerirom med store vinduer og sollys" className="auth-gallery-image" />
        <div className="auth-gallery-heading">
          <span className="font-display text-4xl font-semibold md:text-5xl">Diargio</span>
          <p className="mt-3 text-sm">Et sted for kunsten du elsker.</p>
        </div>
      </section>
      <section className="auth-form-area" aria-label="Innlogging">
        <div className="w-full max-w-[390px]">
          <div className="mb-9 flex border-b border-border" aria-label="Velg innlogging eller ny konto">
            <Button variant="ghost" className={`auth-tab ${mode === "inn" ? "is-active" : ""}`} aria-pressed={mode === "inn"} disabled={busy} onClick={() => { setMode("inn"); setMsg(null); }}>Logg inn</Button>
            <Button variant="ghost" className={`auth-tab ${mode === "ny" ? "is-active" : ""}`} aria-pressed={mode === "ny"} disabled={busy} onClick={() => { setMode("ny"); setMsg(null); }}>Opprett konto</Button>
          </div>
          <h1 className="font-display text-3xl font-semibold">{mode === "inn" ? "Velkommen tilbake" : "Velkommen til Diargio"}</h1>
          <p className="mt-3 mb-7 text-sm leading-relaxed text-muted-foreground">{mode === "inn" ? "Din neste kunstfavoritt venter på deg." : "Finn kunst du elsker. Gi kunsten din et nytt hjem."}</p>
          <Button variant="outline" onClick={google} disabled={busy} className="auth-google h-12 w-full gap-3 rounded-md bg-card text-foreground">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="currentColor"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.3 2.9-7.4ZM12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.9-1.8-5.7-4.2H2.9v2.6A10 10 0 0 0 12 22ZM6.3 13.8a6 6 0 0 1 0-3.6V7.6H2.9a10 10 0 0 0 0 8.8l3.4-2.6ZM12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.5 9.5 0 0 0 12 2a10 10 0 0 0-9.1 5.6l3.4 2.6C7.1 7.8 9.4 6 12 6Z" /></svg>
            Fortsett med Google
          </Button>
          <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />eller med e-post<span className="h-px flex-1 bg-border" /></div>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="auth-email" className="mb-2 block text-xs font-semibold">E-postadresse</label>
              <input id="auth-email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="din@epost.no" className="auth-input" />
            </div>
            <div>
              <label htmlFor="auth-password" className="mb-2 block text-xs font-semibold">Passord</label>
              <div className="relative">
                <input id="auth-password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "inn" ? "current-password" : "new-password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "inn" ? "Ditt passord" : "Minst 6 tegn"} className="auth-input pr-12" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1.5 text-muted-foreground hover:bg-transparent hover:text-gronn" title={showPassword ? "Skjul passord" : "Vis passord"} aria-label={showPassword ? "Skjul passord" : "Vis passord"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</Button>
              </div>
            </div>
            <Button type="submit" disabled={busy} className="h-12 w-full justify-between rounded-md bg-gronn px-5 font-semibold text-primary-foreground shadow-none hover:bg-gronnmork">
              {busy ? "Vennligst vent …" : mode === "inn" ? "Logg inn" : "Opprett konto"}{busy ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <ArrowRight />}
            </Button>
          </form>
          {msg && <p role="status" className="mt-4 border-l-2 border-gronn pl-3 text-sm leading-relaxed text-foreground">{msg}</p>}
          <div className="mt-7 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5" />Trygg innlogging</div>
          <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">Ved å fortsette godtar du Diargios vilkår.</p>
          <Link to="/" className="mt-4 block text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-gronn">Til forsiden</Link>
        </div>
      </section>
    </main>
  );
}
