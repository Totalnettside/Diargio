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
    <header className="sticky top-0 z-20 border-b border-border bg-topbar text-nav-highlight backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center" aria-label="Diargio">
          <img src={diargioLogo.url} alt="Diargio" className="signature-logo h-14 w-auto" />
        </Link>


        <form
          className="hidden min-w-0 flex-1 items-center gap-2 rounded-2xl border border-border bg-card text-ink px-4 py-2.5 xl:flex"
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
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/45"
          />
        </form>

        <nav className="hidden shrink-0 items-center gap-4 text-sm font-semibold text-nav-highlight lg:flex">
          <Link to="/kunst" className="transition-colors hover:text-brandink">
            Kunst
          </Link>
          <Link to="/kunstvegg" className="whitespace-nowrap transition-colors hover:text-brandink">Din kunstvegg</Link>
          <Link to="/utstillinger" className="transition-colors hover:text-brandink">Utstillinger</Link>
          <Link to="/selg" className="transition-colors hover:text-brandink">
            Selg kunst
          </Link>
          <Link to="/meldinger" className="relative transition-colors hover:text-brandink">
            Meldinger
            <UnreadBadge count={unreadMsgs} className="absolute -right-4 -top-2.5" />
          </Link>
          <Link to="/min-side" className="transition-colors hover:text-brandink">
            Min side
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            to="/varsler"
            className="relative grid size-10 place-items-center rounded-2xl bg-topbar glass"
            aria-label="Varsler"
          >
            <Bell className="size-4" />
            <UnreadBadge count={unread} className="absolute -right-1 -top-1" />
          </Link>
          {user ? (
            <>
              <Link
                to="/min-side"
                className="grid size-10 place-items-center overflow-hidden rounded-2xl bg-nav-gold text-sm font-semibold text-brandink glass"
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
                className="hidden rounded-2xl bg-topbar px-3 py-2 text-sm font-semibold text-nav-highlight glass md:block"
              >
                Logg ut
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden rounded-2xl px-3 py-2.5 text-sm font-semibold text-nav-highlight underline-offset-4 hover:underline md:block"
              >
                Logg inn
              </Link>
              <Link
                to="/auth"
                className="rounded-2xl bg-gronn px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md ring-2 ring-nav-highlight/30 transition hover:bg-gronnmork hover:shadow-lg"
              >
                Opprett bruker
              </Link>
            </>
          )}
        </div>
      </div>
      <nav aria-label="Oppdag kunst" className="flex gap-5 overflow-x-auto border-t border-border bg-nav-gold text-brandink px-5 py-2 text-xs font-semibold lg:hidden">
        <Link to="/kunst" className="shrink-0">Kunst</Link><Link to="/kunstvegg" className="shrink-0">Din kunstvegg</Link><Link to="/utstillinger" className="shrink-0">Utstillinger</Link><Link to="/selg" className="shrink-0">Selg kunst</Link>
      </nav>
    </header>
  );
}
