import { Link } from "@tanstack/react-router";
import { useChat } from "@/hooks/useChat";
import { useStore } from "@/lib/store";
import { UnreadBadge } from "@/components/UnreadBadge";
import { Home, MessageCircle, Plus, Search, User } from "lucide-react";

export function BottomNav() {
  const { unread } = useChat();
  const { notifications } = useStore();
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-end justify-around gap-1 border-t border-border bg-topbar px-3 pb-4 pt-2 backdrop-blur-md md:hidden">
      <Link
        to="/"
        className="flex flex-col items-center gap-1 text-nav-highlight/75"
        activeProps={{ className: "flex flex-col items-center gap-1 text-nav-highlight" }}
        activeOptions={{ exact: true }}
      >
        <Home className="size-5" />
        <span className="text-[10px] font-semibold">Hjem</span>
      </Link>
      <Link
        to="/sok"
        className="flex flex-col items-center gap-1 text-nav-highlight/75"
        activeProps={{ className: "flex flex-col items-center gap-1 text-nav-highlight" }}
      >
        <Search className="size-5" />
        <span className="text-[10px] font-semibold">Søk</span>
      </Link>
      <Link
        to="/selg"
        className="-mt-6 grid size-14 place-items-center rounded-full bg-nav-gold text-brandink"
        style={{ boxShadow: "0 14px 26px -12px var(--signature-green)" }}
        aria-label="Selg kunst"
      >
        <Plus className="size-6" />
      </Link>
      <Link
        to="/meldinger"
        className="flex flex-col items-center gap-1 text-nav-highlight/75"
        activeProps={{ className: "flex flex-col items-center gap-1 text-nav-highlight" }}
      >
        <span className="relative"><MessageCircle className="size-5" /><UnreadBadge count={unread} className="absolute -right-2.5 -top-2" /></span>
        <span className="text-[10px] font-semibold">Meld</span>
      </Link>
      <Link
        to="/min-side"
        className="flex flex-col items-center gap-1 text-nav-highlight/75"
        activeProps={{ className: "flex flex-col items-center gap-1 text-nav-highlight" }}
      >
        <span className="relative"><User className="size-5" /><UnreadBadge count={unreadNotifications} className="absolute -right-2.5 -top-2" /></span>
        <span className="text-[10px] font-semibold">Profil</span>
      </Link>
    </nav>
  );
}
