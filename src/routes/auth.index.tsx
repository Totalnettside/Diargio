import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import {safeDestination} from "@/lib/commerce";
import { privateHead, privatePageFor } from "@/lib/seo";
import galleryRoom from "@/assets/gallery-hall-1.webp";

export const Route = createFileRoute("/auth/")({
  validateSearch:(s:Record<string,unknown>):{next?:string} => typeof s["next"] === "string" ? {next:safeDestination(s["next"])} : {},
  head: () => {
    const page = privatePageFor("/auth");
    return privateHead(page.title, page.description);
  },
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
  const {next}=Route.useSearch();

  useEffect(() => {
    if (user) { const destination=safeDestination(next??sessionStorage.getItem("auth-next"));sessionStorage.removeItem("auth-next");void navigate({to:destination}); }
  }, [user, navigate, next]);

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

  const socialSignIn = async (provider: "google" | "microsoft" | "apple") => {
    setBusy(true);
    setMsg(null);
    sessionStorage.setItem("auth-next",safeDestination(next));
    const label = provider === "google" ? "Google" : provider === "microsoft" ? "Microsoft" : "Apple";
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.redirected) return;
      if (result.error) setMsg(`${label}-innlogging feilet. Prøv igjen.`);
      setBusy(false);
    } catch {
      setMsg(`${label}-innlogging feilet. Prøv igjen.`);
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-gallery" aria-label="Diargios kunstrom">
        <img src={galleryRoom} alt="Et lyst gallerirom med store vinduer og sollys" className="auth-gallery-image" />
      </section>
      <section className="auth-form-area" aria-label="Innlogging">
        <div className="w-full max-w-[390px]">
          <div className="mb-9 flex border-b border-border" aria-label="Velg innlogging eller ny konto">
            <Button variant="ghost" className={`auth-tab ${mode === "inn" ? "is-active" : ""}`} aria-pressed={mode === "inn"} disabled={busy} onClick={() => { setMode("inn"); setMsg(null); }}>Logg inn</Button>
            <Button variant="ghost" className={`auth-tab ${mode === "ny" ? "is-active" : ""}`} aria-pressed={mode === "ny"} disabled={busy} onClick={() => { setMode("ny"); setMsg(null); }}>Opprett konto</Button>
          </div>
          <h1 className="font-display text-3xl font-semibold">{mode === "inn" ? "Velkommen tilbake" : "Velkommen til Diargio"}</h1>
          <p className="mt-3 mb-7 text-sm leading-relaxed text-muted-foreground">{mode === "inn" ? "Din neste kunstfavoritt venter på deg." : "Finn kunst du elsker. Gi kunsten din et nytt hjem."}</p>
          <div className="space-y-3">
            <Button type="button" variant="outline" onClick={() => void socialSignIn("google")} disabled={busy} className="auth-google h-12 w-full gap-3 rounded-md bg-card text-foreground">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="currentColor"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.3 2.9-7.4ZM12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.9-1.8-5.7-4.2H2.9v2.6A10 10 0 0 0 12 22ZM6.3 13.8a6 6 0 0 1 0-3.6V7.6H2.9a10 10 0 0 0 0 8.8l3.4-2.6ZM12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.5 9.5 0 0 0 12 2a10 10 0 0 0-9.1 5.6l3.4 2.6C7.1 7.8 9.4 6 12 6Z" /></svg>
              Fortsett med Google
            </Button>
            <Button type="button" variant="outline" onClick={() => void socialSignIn("microsoft")} disabled={busy} className="auth-google h-12 w-full gap-3 rounded-md bg-card text-foreground">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="currentColor"><path d="M2 2h9v9H2zM13 2h9v9h-9zM2 13h9v9H2zM13 13h9v9h-9z" /></svg>
              Fortsett med Microsoft
            </Button>
            <Button type="button" variant="outline" onClick={() => void socialSignIn("apple")} disabled={busy} className="auth-apple h-12 w-full gap-3 rounded-md bg-card px-5 py-0 text-foreground">
              <svg viewBox="0 0 73 73" aria-hidden="true" className="size-12 shrink-0" fill="currentColor"><path d="M47.1055431,11.5129519 C49.8885194,8.51619449 51.4065065,4.29540934 51.1535087,0.0746241978 C47.3585409,0.0746241978 42.9310785,2.31164032 40.1902685,5.56164489 C37.9976205,8.30515523 35.6784735,12.5259404 36.5217997,16.7889334 C40.4432664,17.2532197 44.6598972,14.7629565 47.1055431,11.5129519 L47.1055431,11.5129519 Z M50.8161782,17.7175061 C44.912895,17.7175061 39.6842728,20.9675107 36.9434628,20.9675107 C33.9918212,20.9675107 29.7751904,17.5486747 25.0103975,17.7175061 C18.8119502,17.8441297 13.1194986,21.5162127 9.87269285,26.9188177 C7.68004482,30.7597322 6.79455234,35.2759723 6.83671865,39.918836 C6.92105127,48.6980691 10.3786885,57.8571728 14.4266541,63.7240642 C17.546961,68.1558886 21.0467645,72.9253758 26.0223889,72.9253758 C30.4920176,72.9253758 32.1786699,69.9286183 37.9976205,69.9286183 C43.4370742,69.9286183 45.1658929,72.9253758 49.8885194,72.9253758 C54.8219775,72.9253758 58.1109495,68.4091357 61.0625911,63.9351034 C64.7732262,58.7013299 65.9960492,53.7208034 66.1647144,53.551972 C65.9960492,53.551972 56.6351287,49.7532654 56.2977983,38.9058475 C56.2977983,29.409081 64.0142327,25.146088 64.3093968,24.9350487 C60.1349323,18.4350396 53.3461567,17.7175061 50.8161782,17.7175061 L50.8161782,17.7175061 Z" /></svg>
              Fortsett med Apple
            </Button>
          </div>
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
          <Button asChild variant="link" className="mt-3 px-0"><Link to="/auth/recovery">Glemt passord?</Link></Button>
          {msg && <p role="status" className="mt-4 border-l-2 border-gronn pl-3 text-sm leading-relaxed text-foreground">{msg}</p>}
          <div className="mt-7 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5" />Trygg innlogging</div>
          <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">Ved å fortsette godtar du Diargios vilkår.</p>
          <Link to="/" className="mt-4 block text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-gronn">Til forsiden</Link>
        </div>
      </section>
    </main>
  );
}
