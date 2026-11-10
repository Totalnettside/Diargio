import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UnreadBadge } from "@/components/UnreadBadge";
import { useStore } from "@/lib/store";

export function NotificationMenu() {
  const { notifications } = useStore();
  const unread = notifications.filter((notification) => !notification.read).length;
  const latest = notifications.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="topbar-control relative grid size-10 shrink-0 place-items-center rounded-full bg-topbar p-0 text-nav-highlight hover:bg-gronnlys hover:text-nav-highlight"
          aria-label={`Varsler${unread ? `, ${unread} uleste` : ""}`}
        >
          <Bell className="size-4" />
          <UnreadBadge count={unread} className="absolute -right-1 -top-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(360px,calc(100vw-24px))] rounded-2xl border-nav-outline bg-ivory p-0 text-brandink shadow-xl"
      >
        <DropdownMenuLabel className="flex items-center justify-between px-5 py-4 font-display text-lg">
          Varsler
          {unread > 0 && <span className="font-sans text-xs font-normal text-muted-foreground">{unread} uleste</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0 bg-border" />
        {latest.length ? (
          <div className="max-h-[min(420px,60vh)] overflow-y-auto py-1">
            {latest.map((notification) => (
              <div key={notification.id} className="border-b border-border/70 px-5 py-3 last:border-b-0">
                <div className="flex items-start gap-3">
                  {!notification.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gronn" aria-label="Ulest" />}
                  <div className={notification.read ? "w-full" : "min-w-0 flex-1"}>
                    <p className="text-sm font-semibold">{notification.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{notification.body}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString("nb-NO", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">Ingen varsler ennå.</p>
        )}
        <DropdownMenuSeparator className="m-0 bg-border" />
        <div className="p-2">
          <DropdownMenuItem asChild className="cursor-pointer justify-center rounded-xl px-4 py-3 font-semibold text-gronn focus:bg-gronnlys/20 focus:text-gronn">
            <Link to="/varsler">Se alle varsler</Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
