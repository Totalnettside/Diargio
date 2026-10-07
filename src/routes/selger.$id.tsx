import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArtworkCard } from "@/components/ArtworkCard";
import type { Artwork } from "@/data/demo";

export const Route = createFileRoute("/selger/$id")({
  head: () => ({
    meta: [
      { title: "Kunstnerprofil | Diargio" },
      { name: "description", content: "Se selgerens kunst, omtaler og vurderinger på Diargio." },
      { property: "og:title", content: "Selgerprofil | Diargio" },
      { property: "og:description", content: "Kunst, omtaler og stjerner fra kjøpere." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SellerPage,
});

type Profile = {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  bankid_verified: boolean;
  created_at: string;
  story: string | null;
  techniques: string[];
  studio_images: string[];
};
type Review = { id: string; reviewer_id: string; rating: number; comment: string | null; created_at: string };

const nameOf = (p?: { display_name: string | null; first_name: string | null; last_name: string | null } | null) =>
  p ? [p.first_name, p.last_name].filter(Boolean).join(" ") || p.display_name || "Bruker" : "Bruker";

function Stars({ value, size = "size-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${size} ${i <= Math.round(value) ? "fill-brand text-brand" : "text-ink/20"}`} />
      ))}
    </span>
  );
}

function SellerPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [listings, setListings] = useState<Artwork[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewers, setReviewers] = useState<Record<string, string>>({});
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [err, setErr] = useState("");
  const [soldIds, setSoldIds] = useState<Set<string>>(new Set());
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(false);
  useEffect(() => {
    if (!user || user.id === id) return setFollowing(false);
    void supabase.from("artist_follows").select("artist_id").eq("follower_id", user.id).eq("artist_id", id).maybeSingle().then(({ data }) => setFollowing(!!data));
  }, [user, id]);
  const toggleFollow = async () => {
    if (!user) return;
    const { error } = following
      ? await supabase.from("artist_follows").delete().eq("follower_id", user.id).eq("artist_id", id)
      : await supabase.from("artist_follows").insert({ artist_id: id });
    if (!error) { setFollowing(!following); setFollowers((n) => n + (following ? -1 : 1)); }
  };

  const load = useCallback(async () => {
    const [{ data: p }, { data: l }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, first_name, last_name, avatar_url, bio, location, website, bankid_verified, created_at, story, techniques, studio_images").eq("id", id).maybeSingle(),
      supabase.from("listings").select("id, data").eq("user_id", id).order("created_at", { ascending: false }),
      supabase.from("reviews").select("id, reviewer_id, rating, comment, created_at").eq("seller_id", id).order("created_at", { ascending: false }),
    ]);
    setProfile(p ?? null);
    const [{ data: sold }, { data: fc }] = await Promise.all([
      supabase.rpc("sold_listing_ids", { _seller: id }),
      supabase.rpc("artist_follower_count", { _artist: id }),
    ]);
    setSoldIds(new Set((sold ?? []) as string[]));
    setFollowers(fc ?? 0);
    setListings((l ?? []).map((x) => x.data as unknown as Artwork));
    setReviews(r ?? []);
    const ids = [...new Set((r ?? []).map((x) => x.reviewer_id))];
    if (ids.length) {
      const { data: ps } = await supabase.from("profiles").select("id, display_name, first_name, last_name").in("id", ids);
      setReviewers(Object.fromEntries((ps ?? []).map((x) => [x.id, nameOf(x)])));
    }
  }, [id]);

  const [hasBought, setHasBought] = useState(false);
  useEffect(() => {
    if (!user || user.id === id) return setHasBought(false);
    void supabase.from("purchases").select("id").eq("buyer_id", user.id).eq("seller_id", id).limit(1).then(({ data }) => setHasBought(!!data?.length));
  }, [user, id]);
  useEffect(() => {
    void load();
  }, [load]);

  if (profile === undefined) return <main className="mx-auto max-w-6xl px-5 py-10 text-sm text-ink/60">Laster profil …</main>;
  if (profile === null)
    return (
      <main className="mx-auto max-w-3xl px-5 py-10 text-center">
        <h1 className="font-display text-2xl font-semibold">Fant ikke selgeren</h1>
        <Link to="/kunst" className="mt-4 inline-block rounded-2xl bg-brandink px-6 py-3 text-sm font-semibold text-primary-foreground">Utforsk kunst</Link>
      </main>
    );

  const name = nameOf(profile);
  const available = listings.filter((a) => !soldIds.has(a.id));
  const soldWorks = listings.filter((a) => soldIds.has(a.id));
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const mine = reviews.find((r) => r.reviewer_id === user?.id);
  const canReview = user && user.id !== id && hasBought;

  const submit = async () => {
    setErr("");
    const { error } = mine
      ? await supabase.from("reviews").update({ rating, comment: comment.trim() || null }).eq("id", mine.id)
      : await supabase.from("reviews").insert({ seller_id: id, rating, comment: comment.trim() || null });
    if (error) setErr("Kunne ikke lagre omtalen.");
    else {
      setComment("");
      void load();
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-6">
      <section className="flex flex-col gap-5 rounded-3xl p-6 glass md:flex-row md:items-center">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={name} className="size-24 rounded-full object-cover" />
        ) : (
          <div className="grid size-24 place-items-center rounded-full bg-secondary font-display text-3xl font-semibold text-brandink">{name.slice(0, 1).toUpperCase()}</div>
        )}
        <div className="flex-1">
          <h1 className="font-display text-3xl font-semibold">{name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink/60">
            {reviews.length ? (<><Stars value={avg} /><span>{avg.toFixed(1)} · {reviews.length} omtaler</span></>) : <span>Ny selger · Ingen vurderinger ennå</span>}
            {profile.bankid_verified && <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-brandink">✓ BankID</span>}
          </div>
          <p className="mt-1 text-sm text-ink/55">
            {profile.location ? `${profile.location} · ` : ""}Medlem siden {new Date(profile.created_at).getFullYear()} · {followers} følgere
          </p>
          {profile.bio && <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm">{profile.bio}</p>}
          {profile.website && (
            <a href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-brandink underline">
              {profile.website}
            </a>
          )}
          {profile.techniques.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.techniques.map((t) => <span key={t} className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-brandink">{t}</span>)}
            </div>
          )}
          {user && user.id !== id && (
            <button onClick={() => void toggleFollow()} className={`mt-4 rounded-2xl px-5 py-2 text-sm font-semibold ${following ? "bg-secondary text-brandink" : "bg-brandink text-primary-foreground"}`}>
              {following ? "Følger ✓" : "Følg kunstner"}
            </button>
          )}
          {!user && <p className="mt-3 text-xs text-ink/55"><Link to="/auth" className="underline">Logg inn</Link> for å følge og få varsel om nye verk.</p>}
          {following && <p className="mt-1 text-xs text-ink/55">Du får varsel når {name} legger ut nye verk.</p>}
        </div>
      </section>

      {profile.story && (
        <section className="mt-8 rounded-3xl p-6 glass">
          <h2 className="font-display text-xl font-semibold">Historien bak kunsten</h2>
          <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed">{profile.story}</p>
        </section>
      )}

      {profile.studio_images.length > 0 && (
        <>
          <h2 className="mt-8 font-display text-xl font-semibold">Fra atelieret</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            {profile.studio_images.map((u) => <img key={u} src={u} alt={`Fra atelieret til ${name}`} loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />)}
          </div>
        </>
      )}

      <h2 className="mt-8 font-display text-xl font-semibold">Tilgjengelige verk ({available.length})</h2>
      {available.length === 0 ? (
        <p className="mt-2 text-sm text-ink/60">Ingen tilgjengelige verk akkurat nå.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {available.map((a) => <ArtworkCard key={a.id} artwork={a} />)}
        </div>
      )}

      {soldWorks.length > 0 && (
        <>
          <h2 className="mt-8 font-display text-xl font-semibold">Solgte verk ({soldWorks.length})</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 opacity-75 md:grid-cols-4">
            {soldWorks.map((a) => <ArtworkCard key={a.id} artwork={a} />)}
          </div>
        </>
      )}

      <h2 className="mt-10 font-display text-xl font-semibold">Omtaler ({reviews.length})</h2>
      {user && user.id !== id && !hasBought && <p className="mt-2 text-sm text-ink/60">Du kan skrive omtale etter at du har kjøpt kunst av selgeren.</p>}
      {canReview && (
        <div className="mt-3 rounded-3xl p-5 glass">
          <p className="text-sm font-semibold">{mine ? "Endre omtalen din" : "Skriv en omtale"}</p>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} onClick={() => setRating(i)} aria-label={`${i} stjerner`}>
                <Star className={`size-6 ${i <= rating ? "fill-brand text-brand" : "text-ink/25"}`} />
              </button>
            ))}
          </div>
          <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Hvordan var handelen?" className="mt-3 w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none glass" />
          <button onClick={() => void submit()} className="mt-2 rounded-2xl bg-brandink px-5 py-2.5 text-sm font-semibold text-primary-foreground">Publiser omtale</button>
          {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
        </div>
      )}
      {!user && <p className="mt-2 text-sm text-ink/60"><Link to="/auth" className="underline">Logg inn</Link> for å skrive en omtale.</p>}
      <div className="mt-4 space-y-3">
        {reviews.length === 0 && <p className="text-sm text-ink/60">Ingen omtaler ennå.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="rounded-2xl p-4 glass">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{reviewers[r.reviewer_id] ?? "Bruker"}</p>
              <Stars value={r.rating} size="size-3.5" />
            </div>
            {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
            <p className="mt-1 text-xs text-ink/45">{new Date(r.created_at).toLocaleDateString("nb-NO")}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
