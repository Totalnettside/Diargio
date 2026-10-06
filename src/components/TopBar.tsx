import { Link, useNavigate } from "@tanstack/react-router";
import diargioLogo from "@/assets/diargio-logo.png.asset.json";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { UnreadBadge } from "@/components/UnreadBadge";
import { supabase } from "@/integrations/supabase/client";

export function TopBar() {
  const { notifications } = useStore();
  const { user, signOut } = useAuth();
  const { unread: unreadMsgs } = useChat();
  const unread = notifications.filter((n) => !n.read).length;
  const [q, setQ] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setAvatar(null);
      return;
    }
    let alive = true;
    supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (alive) setAvatar(data?.avatar_url ?? null);
      });
    return () => {
      alive = false;
    };
  }, [user?.id]);


  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-sage/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center" aria-label="Diargio">
          <img src={diargioLogo.url} alt="Diargio" className="h-10 w-auto" />
        </Link>


        <form
          className="hidden flex-1 items-center gap-2 rounded-2xl bg-white/70 px-4 py-2.5 md:flex"
          style={{ boxShadow: "inset 0 0 0 1px oklch(1 0 0)" }}
          onSubmit={(e) => {
            e.preventDefault();
            void navigate({ to: "/sok", search: { q } });
          }}
        >
          <Search className="size-4 opacity-60" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Søk etter kunstner, verk, stil eller kategori"
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/45"
          />
        </form>

        <nav className="hidden items-center gap-5 text-sm font-semibold tracking-wide text-white/90 md:flex">
          <Link to="/" className="transition-colors hover:text-white">
            Hjem
          </Link>
          <Link to="/kunst" className="transition-colors hover:text-white">
            Kunst
          </Link>
          <Link to="/selg" className="transition-colors hover:text-white">
            Selg kunst
          </Link>
          <Link to="/meldinger" className="relative transition-colors hover:text-white">
            Meldinger
            <UnreadBadge count={unreadMsgs} className="absolute -right-4 -top-2.5" />
          </Link>
          <Link to="/min-side" className="transition-colors hover:text-white">
            Min side
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            to="/varsler"
            className="relative grid size-10 place-items-center rounded-2xl bg-white/60 glass"
            aria-label="Varsler"
          >
            <Bell className="size-4" />
            <UnreadBadge count={unread} className="absolute -right-1 -top-1" />
          </Link>
          {user ? (
            <>
              <Link
                to="/min-side"
                className="grid size-10 place-items-center overflow-hidden rounded-2xl bg-white/60 text-sm font-semibold text-brandink glass"
                aria-label="Min side"
              >
                {avatar ? (
                  <img src={avatar} alt="Profilbilde" className="size-full object-cover" />
                ) : (
                  (user.email ?? "?").slice(0, 1).toUpperCase()
                )}
              </Link>
              <button
                onClick={() => void signOut()}
                className="hidden rounded-2xl bg-white/60 px-3 py-2 text-sm font-semibold text-ink glass md:block"
              >
                Logg ut
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-2xl bg-brand px-4 py-2.5 text-sm font-semibold text-white"
            >
              Logg inn
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
