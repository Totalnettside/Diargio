import { Link } from "@tanstack/react-router";
import { Home, MessageCircle, Plus, Search, User } from "lucide-react";

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-end justify-around gap-1 border-t border-white/60 bg-white/80 px-3 pb-4 pt-2 backdrop-blur-md md:hidden">
      <Link
        to="/"
        className="flex flex-col items-center gap-1 text-ink/45"
        activeProps={{ className: "flex flex-col items-center gap-1 text-brandink" }}
        activeOptions={{ exact: true }}
      >
        <Home className="size-5" />
        <span className="text-[10px] font-semibold">Hjem</span>
      </Link>
      <Link
        to="/sok"
        className="flex flex-col items-center gap-1 text-ink/45"
        activeProps={{ className: "flex flex-col items-center gap-1 text-brandink" }}
      >
        <Search className="size-5" />
        <span className="text-[10px] font-semibold">Søk</span>
      </Link>
      <Link
        to="/selg"
        className="-mt-6 grid size-14 place-items-center rounded-full bg-brandink text-primary-foreground"
        style={{ boxShadow: "0 14px 26px -12px oklch(0.48 0.219 285)" }}
        aria-label="Selg kunst"
      >
        <Plus className="size-6" />
      </Link>
      <Link
        to="/meldinger"
        className="flex flex-col items-center gap-1 text-ink/45"
        activeProps={{ className: "flex flex-col items-center gap-1 text-brandink" }}
      >
        <MessageCircle className="size-5" />
        <span className="text-[10px] font-semibold">Meld</span>
      </Link>
      <Link
        to="/min-side"
        className="flex flex-col items-center gap-1 text-ink/45"
        activeProps={{ className: "flex flex-col items-center gap-1 text-brandink" }}
      >
        <User className="size-5" />
        <span className="text-[10px] font-semibold">Profil</span>
      </Link>
    </nav>
  );
}
