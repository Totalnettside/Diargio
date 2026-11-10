import { Link } from "@tanstack/react-router";
import diargioLogo from "@/assets/diargio-logo.png.asset.json";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NotificationMenu } from "@/components/NotificationMenu";
import { useStore } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { UnreadBadge } from "@/components/UnreadBadge";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function TopBar() {
  const { user, signOut } = useAuth();
  const { unread: unreadMsgs } = useChat();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className={`site-topbar sticky top-0 z-20 border-b border-border bg-topbar text-nav-highlight backdrop-blur-md${user ? " is-authenticated" : ""}`}>
      <span aria-hidden="true" className="topbar-gallery-light" />
      <div className="topbar-inner mx-auto grid w-full grid-cols-[minmax(0,1fr)_auto] items-center">
        <Link to="/" className="signature-logo-link flex items-center" style={{ ["--logo-source" as string]: `url("${diargioLogo.url}")` }} aria-label="Diargio">
          <img src={diargioLogo.url} alt="Diargio" className="signature-logo h-[58.8px] w-auto" />
        </Link>


        <nav aria-label="Hovedmeny" className="topbar-main-nav shrink-0 items-center text-sm font-semibold text-nav-highlight">
          <Link to="/kunst" className="transition-colors hover:text-primary-foreground">
            Kunst
          </Link>
          <Link to="/kunstvegg" className="whitespace-nowrap transition-colors hover:text-primary-foreground">Din kunstvegg</Link>
          <Link to="/utstillinger" className="transition-colors hover:text-primary-foreground">Utstillinger</Link>
          <Link to="/selg" className="transition-colors hover:text-primary-foreground">
            Selg kunst
          </Link>
          {user && (
            <>
              <Link to="/meldinger" className="relative transition-colors hover:text-primary-foreground">
                Meldinger
                <UnreadBadge count={unreadMsgs} className="absolute -right-4 -top-2.5" />
              </Link>
              <Link to="/min-side" className="transition-colors hover:text-primary-foreground">
                Min side
              </Link>
            </>
          )}
        </nav>

        <div className="topbar-account flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          <NotificationMenu />
          {user ? (
            <>
              <Link
                to="/min-side"
                className="topbar-avatar grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-nav-gold text-sm font-semibold text-brandink"
                aria-label="Min side"
              >
                {avatar ? (
                  <img src={avatar} alt="Profilbilde" className="size-full object-cover" />
                ) : (
                  (user.email ?? "?").slice(0, 1).toUpperCase()
                )}
              </Link>
              <Button variant="ghost"
                onClick={() => void signOut()}
                className="topbar-control topbar-logout hidden rounded-full bg-topbar px-3 py-2 text-sm font-semibold text-nav-highlight hover:bg-gronnlys hover:text-nav-highlight md:block"
              >
                Logg ut
              </Button>
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
                className="topbar-signup rounded-full bg-gronn px-4 py-2.5 text-sm font-bold text-primary-foreground ring-1 ring-nav-highlight/50 transition hover:bg-gronnlys"
              >
                Opprett bruker
              </Link>
            </>
          )}
          <Button variant="ghost" size="icon" className="topbar-menu-toggle topbar-control text-nav-highlight hover:bg-gronnlys hover:text-nav-highlight" aria-label={menuOpen ? "Lukk meny" : "Åpne meny"} aria-expanded={menuOpen} aria-controls="topbar-expanded-menu" onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {menuOpen && (
        <nav id="topbar-expanded-menu" aria-label="Alle menypunkter" className="topbar-expanded-menu" onClick={() => setMenuOpen(false)}>
          <Link to="/kunst">Kunst</Link>
          <Link to="/kunstvegg">Din kunstvegg</Link>
          <Link to="/utstillinger">Utstillinger</Link>
          <Link to="/selg">Selg kunst</Link>
          {user && (
            <>
              <Link to="/meldinger">Meldinger <UnreadBadge count={unreadMsgs} /></Link>
              <Link to="/min-side">Min side</Link>
            </>
          )}
          {user ? <Button variant="ghost" className="text-nav-highlight hover:bg-gronnlys hover:text-nav-highlight" onClick={() => void signOut()}>Logg ut</Button> : <Link to="/auth">Logg inn / Opprett bruker</Link>}
        </nav>
      )}
    </header>
  );
}
