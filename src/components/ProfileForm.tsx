import { useEffect, useState } from "react";
import { z } from "zod";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  first_name: z.string().trim().min(1, "Skriv inn fornavn").max(60),
  last_name: z.string().trim().min(1, "Skriv inn etternavn").max(60),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ]{8,15}$/, "Ugyldig telefonnummer"),
  bio: z.string().trim().max(1000).optional(),
  location: z.string().trim().max(100).optional(),
  website: z.string().trim().max(200).optional(),
});

type Values = {
  first_name: string;
  last_name: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
  avatar_url: string;
};

const empty: Values = { first_name: "", last_name: "", phone: "", bio: "", location: "", website: "", avatar_url: "" };

export function ProfileForm({ compact = false, onSaved }: { compact?: boolean; onSaved?: () => void }) {
  const { user } = useAuth();
  const [v, setV] = useState<Values>(empty);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("profiles")
      .select("first_name,last_name,phone,bio,location,website,avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const d = data as Record<string, string | null>;
          setV(Object.fromEntries(Object.keys(empty).map((k) => [k, d[k] ?? ""])) as Values);
        }
      });
  }, [user]);

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));

  async function upload(file: File) {
    if (!user) return;
    if (!file.type.startsWith("image/")) return setError("Velg et bilde");
    if (file.size > 5 * 1024 * 1024) return setError("Bildet er for stort (maks 5 MB)");
    setBusy(true);
    const path = `${user.id}/avatar-${Date.now()}.${file.name.split(".").pop() ?? "jpg"}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) {
      setBusy(false);
      return setError("Kunne ikke laste opp bildet");
    }
    const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
    const url = data?.signedUrl ?? "";
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    setV((p) => ({ ...p, avatar_url: url }));
    setBusy(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMsg("");
    const parsed = schema.safeParse(v);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Sjekk feltene");
    if (!user) return;
    setBusy(true);
    const d = parsed.data;
    const { error: err } = await supabase
      .from("profiles")
      .update({
        first_name: d.first_name,
        last_name: d.last_name,
        phone: d.phone,
        bio: d.bio || null,
        location: d.location || null,
        website: d.website || null,
        display_name: `${d.first_name} ${d.last_name}`,
        onboarded: true,
      })
      .eq("id", user.id);
    setBusy(false);
    if (err) return setError("Kunne ikke lagre. Prøv igjen.");
    setMsg("Lagret!");
    onSaved?.();
  }

  const input = "mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand";

  return (
    <form onSubmit={save} className="space-y-3">
      <div className="flex items-center gap-4">
        <label className="relative grid size-20 cursor-pointer place-items-center overflow-hidden rounded-full bg-mist ring-1 ring-border">
          {v.avatar_url ? (
            <img src={v.avatar_url} alt="Profilbilde" className="size-full object-cover" />
          ) : (
            <Camera className="size-6 text-ink/40" />
          )}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
        <p className="text-xs text-ink/55">Trykk for å {v.avatar_url ? "bytte" : "legge til"} profilbilde</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">Fornavn *<input className={input} value={v.first_name} onChange={set("first_name")} /></label>
        <label className="text-sm font-medium">Etternavn *<input className={input} value={v.last_name} onChange={set("last_name")} /></label>
      </div>
      <label className="block text-sm font-medium">Telefonnummer *<input type="tel" className={input} value={v.phone} onChange={set("phone")} placeholder="+47 400 00 000" /></label>
      {!compact && (
        <>
          <label className="block text-sm font-medium">Sted<input className={input} value={v.location} onChange={set("location")} placeholder="Oslo" /></label>
          <label className="block text-sm font-medium">Nettside<input className={input} value={v.website} onChange={set("website")} placeholder="https://" /></label>
          <label className="block text-sm font-medium">Om meg<textarea rows={4} className={input} value={v.bio} onChange={set("bio")} placeholder="Fortell litt om deg selv og kunsten din" /></label>
        </>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {msg && <p className="text-sm text-brandink">{msg}</p>}
      <button disabled={busy} className="w-full rounded-2xl bg-brandink py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
        {busy ? "Lagrer…" : "Lagre"}
      </button>
    </form>
  );
}
