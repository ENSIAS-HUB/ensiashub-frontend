"use client";

import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Search,
  CheckCheck,
  ExternalLink,
  UserCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/store/authStore";
import { useMyProfile } from "@/lib/hooks/useProfile";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { logout as apiLogout } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn, getStorageUrl } from "@/lib/utils";
import { CommandPalette } from "@/components/common/CommandPalette";

const ROLE_LABELS: Record<string, string> = {
  etudiant: "Étudiant",
  delegue: "Délégué",
  chef_scolarite: "Chef de Scolarité",
  president_club: "Président de Club",
  admin: "Admin",
};

const SEGMENT_LABELS: Record<string, string> = {
  feed: "Feed",
  groups: "Groupes",
  drive: "The Drive",
  eats: "ENSIAS Eats",
  kitchen: "Cuisine",
  "smart-campus": "Smart Campus",
  map: "Carte",
  settings: "Paramètres",
  admin: "Admin Panel",
};

function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0)
    return (
      <span className="font-mono text-xs text-foreground font-medium">
        ENSIAS Hub
      </span>
    );

  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        const label =
          SEGMENT_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && (
              <span className="font-mono text-[11px] text-muted-foreground/40 select-none">
                /
              </span>
            )}
            <span
              className={cn(
                "font-mono text-[11px]",
                isLast
                  ? "text-foreground font-medium"
                  : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </span>
        );
      })}
    </nav>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: profileData } = useMyProfile();
  const avatarUrl = getStorageUrl(
    profileData?.avatar_url ?? user?.avatar_url ?? user?.avatar,
  );
  const { notifications, unreadCount, markAllRead } = useNotificationStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useNotifications();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "EH";

  const roleLabel = user?.role ? (ROLE_LABELS[user.role] ?? user.role) : null;

  const handleLogout = async () => {
    try {
      await apiLogout();
    } finally {
      logout();
      router.push("/login");
    }
  };

  const handleOpenSheet = (open: boolean) => {
    setSheetOpen(open);
    if (open && unreadCount > 0) markAllRead();
  };

  return (
    <>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      <header
        id="main-content"
        className="sticky top-0 z-30 flex h-12 items-center justify-between dark:bg-[#0d1117]/90 bg-white/85 backdrop-blur-xl border-b dark:border-white/[0.06] border-black/[0.05] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)] shadow-[0_1px_0_0_rgba(0,0,0,0.06)] px-4 transition-colors duration-700"
      >
        <Breadcrumb pathname={pathname} />

        <div className="flex items-center gap-1">
          {/* Search / Command palette trigger */}
          <Button
            variant="ghost"
            onClick={() => setPaletteOpen(true)}
            aria-label="Ouvrir la palette de commandes (⌘K)"
            className="hidden sm:flex items-center gap-1.5 h-8 px-3 dark:bg-white/[0.06] dark:hover:bg-white/[0.08] bg-black/[0.04] hover:bg-black/[0.07] border dark:border-white/[0.08] border-black/[0.08] dark:hover:border-white/[0.15] hover:border-black/[0.15] backdrop-blur-sm rounded-xl text-[11px] font-mono dark:text-white/70 text-gray-600 dark:hover:text-white/90 hover:text-gray-900 transition-all duration-200"
          >
            <Search className="size-3.5 shrink-0" />
            <span>Rechercher...</span>
            <kbd className="ml-0.5 text-[9px] bg-white/6 border border-white/10 rounded px-1 py-0.5">
              ⌘K
            </kbd>
          </Button>

          {/* Separator */}
          <div className="hidden sm:block h-4 w-px dark:bg-white/10 bg-black/10 mx-1" />

          {/* Notification bell */}
          <Sheet open={sheetOpen} onOpenChange={handleOpenSheet}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
                className="relative size-8 rounded-lg hover:bg-white/5"
              >
                <Bell className="size-4" />
                {unreadCount > 0 ? (
                  <Badge className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-1 text-[9px] font-bold bg-[#B01817] text-white border-0 rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                ) : (
                  <>
                    <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[#B01817] animate-ping opacity-60" />
                    <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[#B01817]" />
                  </>
                )}
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-80 p-0 flex flex-col">
              <SheetHeader
                className="px-4 py-3 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-[13px] flex items-center gap-2">
                    <Bell className="size-3.5 text-[#B01817]" />
                    Notifications
                    {unreadCount > 0 && (
                      <Badge className="bg-[#B01817] text-white text-[9px] h-4 px-1.5 border-0">
                        {unreadCount}
                      </Badge>
                    )}
                  </SheetTitle>
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[11px] gap-1 text-muted-foreground"
                      onClick={markAllRead}
                    >
                      <CheckCheck className="size-3" />
                      Tout lire
                    </Button>
                  )}
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                      <Bell className="size-5 text-muted-foreground" />
                    </div>
                    <p className="text-[13px] font-medium">Tout est calme</p>
                    <p className="text-xs text-muted-foreground">
                      Pas de nouvelles, bonnes nouvelles ! 🎉
                    </p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {notifications.map((notif, i) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        transition={{
                          delay: i * 0.04,
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      >
                        <Link
                          href={notif.href}
                          onClick={() => setSheetOpen(false)}
                          className={cn(
                            "flex gap-3 px-4 py-3 border-b transition-colors hover:bg-muted/50",
                            !notif.read && "bg-[#B01817]/5",
                          )}
                          style={{ borderColor: "rgba(255,255,255,0.05)" }}
                        >
                          <span
                            className={cn(
                              "mt-1.5 size-1.5 rounded-full shrink-0",
                              !notif.read ? "bg-[#B01817]" : "bg-transparent",
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold leading-tight">
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                              {notif.message}
                            </p>
                            <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">
                              {timeAgo(notif.created_at)}
                            </p>
                          </div>
                          <ExternalLink className="size-3 shrink-0 mt-1 text-muted-foreground/40" />
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menu utilisateur"
                className="size-8 rounded-full p-0 hover:bg-white/5"
              >
                <Avatar className="size-7">
                  <AvatarImage src={avatarUrl} alt={user?.name} />
                  <AvatarFallback className="bg-[#B01817]/15 text-[#B01817] text-[10px] font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-normal pb-0">
                <p className="text-[13px] font-medium truncate">{user?.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground truncate">
                  {user?.email}
                </p>
                {roleLabel && (
                  <span className="inline-flex items-center mt-1.5 font-mono text-[10px] uppercase tracking-wide bg-[#B01817]/10 text-[#B01817] border border-[#B01817]/20 rounded px-1.5 py-0.5">
                    {roleLabel}
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[13px]" asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <UserCircle className="size-3.5" />
                  Mon Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[13px]" asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="size-3.5" />
                  Paramètres
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-[13px] text-destructive focus:text-destructive flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="size-3.5" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
