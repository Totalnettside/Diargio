import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Search } from "lucide-react";
import { useStore } from "@/lib/store";

export function TopBar() {
  const { notifications } = useStore();
  const unread = notifications.filter((n) => !n.read).length;
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-mist/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span
            className="grid size-9 place-items-center rounded-2xl bg-gradient-to-br from-lav via-peach to-mint font-display text-lg font-semibold text-brandink"
            style={{ boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.7)" }}
          >
            G
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Geargio</span>
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

        <nav className="hidden items-center gap-5 text-sm font-semibold md:flex">
          <Link to="/kunst" className="hover:text-brandink">
            Kunst
          </Link>
          <Link to="/galleri" className="hover:text-brandink">
            Galleri
          </Link>
          <Link to="/selg" className="hover:text-brandink">
            Selg kunst
          </Link>
          <Link to="/meldinger" className="hover:text-brandink">
            Meldinger
          </Link>
          <Link to="/min-side" className="hover:text-brandink">
            Min side
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/varsler"
            className="relative grid size-10 place-items-center rounded-2xl bg-white/60 glass"
            aria-label="Varsler"
          >
            <Bell className="size-4" />
            {unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-brand" />}
          </Link>
          {user ? (
            <>
              <Link
                to="/min-side"
                className="grid size-10 place-items-center rounded-2xl bg-white/60 text-sm font-semibold text-brandink glass"
                aria-label="Min side"
              >
                {(user.email ?? "?").slice(0, 1).toUpperCase()}
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
