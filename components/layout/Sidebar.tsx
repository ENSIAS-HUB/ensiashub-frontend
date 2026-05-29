"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Zap,
  Settings,
  LogOut,
  ShieldCheck,
  ChefHat,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/store/authStore";
import { useMyProfile } from "@/lib/hooks/useProfile";
import { logout as apiLogout } from "@/lib/api/auth";
import { cn, getStorageUrl } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getVisibleNavItems } from "@/lib/config/navigation";
import type { RoleType } from "@/lib/types";

const ROLE_LABELS: Record<string, string> = {
  cuisinier: "Cuisine",
  etudiant: "Étudiant",
  delegue: "Délégué",
  chef_scolarite: "Scolarité",
  president_club: "Président",
  admin: "Admin",
};

const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED = 52;
const LS_KEY = "sidebar-collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: profileData } = useMyProfile();
  // Profile query is the source of truth for avatar (updated on upload)
  const avatarUrl = getStorageUrl(
    profileData?.avatar_url ?? user?.avatar_url ?? user?.avatar,
  );
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored !== null) setCollapsed(stored === "true");
    } catch {}
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(LS_KEY, String(next));
      } catch {}
      return next;
    });
  };

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

  return (
    <TooltipProvider delayDuration={200}>
      <motion.aside
        className="flex h-full shrink-0 flex-col dark:bg-[#0d1117] bg-white/95 border-r dark:border-white/[0.06] border-black/[0.06] overflow-hidden transition-colors duration-700"
        animate={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        initial={false}
      >
        {/* Logo area */}
        <div
          className={cn(
            "flex items-center py-4 shrink-0",
            collapsed ? "justify-center px-0" : "px-4",
          )}
        >
          {collapsed ? (
            <div className="flex size-7 items-center justify-center rounded-md bg-[#B01817] shadow-[0_0_10px_rgba(176,24,23,0.35)] shrink-0">
              <Zap className="size-3.5 text-white" fill="white" />
            </div>
          ) : (
            <AnimatePresence initial={false}>
              <motion.div
                key="logo-expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                {/* Logo image */}
                <img
                  src="/images/ensias-hub-only-logo.png"
                  alt="ENSIAS HUB logo"
                  className="w-9 h-9 object-contain flex-shrink-0"
                />

                {/* Texte */}
                <div className="flex flex-col leading-tight">
                  <span className="text-white font-bold text-sm tracking-wide">
                    ENSIAS
                  </span>
                  <span className="text-[#B01817] font-semibold text-xs tracking-widest">
                    HUB
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div className="h-px bg-sidebar-border shrink-0" />

        {/* User area */}
        <div
          className={cn(
            "flex items-center gap-2.5 py-3 shrink-0",
            collapsed ? "justify-center px-0" : "px-3",
          )}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/profile">
                  <Avatar className="size-7 ring-1 ring-[#B01817]/30 cursor-pointer shrink-0">
                    <AvatarImage src={avatarUrl} alt={user?.name} />
                    <AvatarFallback className="bg-[#B01817]/15 text-[#B01817] text-[10px] font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-sans text-xs">
                {user?.name ?? "Étudiant"} — Mon profil
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              <Link href="/profile">
                <Avatar className="size-7 ring-1 ring-[#B01817]/30 shrink-0 cursor-pointer">
                  <AvatarImage src={avatarUrl} alt={user?.name} />
                  <AvatarFallback className="bg-[#B01817]/15 text-[#B01817] text-[10px] font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0 flex-1">
                <Link href="/profile" className="hover:underline">
                  <p className="truncate text-[13px] font-medium leading-tight">
                    {user?.name ?? "Étudiant"}
                  </p>
                </Link>
                {roleLabel && (
                  <p className="font-mono text-[10px] text-[#B01817]/70 uppercase tracking-wide leading-tight mt-0.5">
                    {roleLabel}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="h-px bg-sidebar-border shrink-0" />

        {/* Navigation */}
        <nav
          role="navigation"
          aria-label="Main navigation"
          className="flex-1 px-1.5 py-2 space-y-0.5 overflow-y-auto"
        >
          {!collapsed && (
            <p className="px-2 pb-1.5 pt-0.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 select-none">
              Navigation
            </p>
          )}
          {getVisibleNavItems(user?.role as RoleType | undefined).map(
            ({ href, icon: Icon, label }) => {
              const isActive =
                pathname === href || pathname.startsWith(href + "/");
              if (collapsed) {
                return (
                  <Tooltip key={href}>
                    <TooltipTrigger asChild>
                      <Link href={href}>
                        <div
                          className={cn(
                            "flex items-center justify-center h-8 w-8 mx-auto rounded-md transition-colors duration-150",
                            isActive
                              ? "bg-[#B01817]/10 text-[#B01817]"
                              : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                          )}
                          aria-label={label}
                        >
                          <Icon className="size-4 shrink-0" />
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-sans text-xs">
                      {label}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return (
                <Link key={href} href={href}>
                  <div
                    className={cn(
                      "flex items-center gap-2.5 h-8 rounded-md px-2.5 text-[13px] font-medium transition-colors duration-150",
                      isActive
                        ? "bg-[#B01817]/10 text-[#B01817]"
                        : "text-[oklch(0.45_0.04_260)] hover:bg-white/5 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{label}</span>
                  </div>
                </Link>
              );
            },
          )}

          {(user?.role === "chef_scolarite" || user?.role === "superAdmin") && (
            <>
              {!collapsed && (
                <p className="px-2 pb-1.5 pt-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 select-none">
                  Administration
                </p>
              )}
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/admin">
                      <div
                        className={cn(
                          "flex items-center justify-center h-8 w-8 mx-auto rounded-md transition-colors duration-150",
                          pathname.startsWith("/admin")
                            ? "bg-[#B01817]/10 text-[#B01817]"
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                        )}
                        aria-label="Admin Panel"
                      >
                        <ShieldCheck className="size-4 shrink-0" />
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-sans text-xs">
                    Admin Panel
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link href="/admin">
                  <div
                    className={cn(
                      "flex items-center gap-2.5 h-8 rounded-md px-2.5 text-[13px] font-medium transition-colors duration-150",
                      pathname.startsWith("/admin")
                        ? "bg-[#B01817]/10 text-[#B01817]"
                        : "text-[oklch(0.45_0.04_260)] hover:bg-white/5 hover:text-foreground",
                    )}
                  >
                    <ShieldCheck className="size-4 shrink-0" />
                    <span>Admin Panel</span>
                  </div>
                </Link>
              )}
            </>
          )}

          {(user?.role === "cuisinier" || user?.role === "superAdmin") && (
            <>
              {!collapsed && (
                <p className="px-2 pb-1.5 pt-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 select-none">
                  Cuisine
                </p>
              )}
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/eats/kitchen">
                      <div
                        className={cn(
                          "flex items-center justify-center h-8 w-8 mx-auto rounded-md transition-colors duration-150",
                          pathname.startsWith("/eats/kitchen")
                            ? "bg-orange-600/10 text-orange-600"
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                        )}
                        aria-label="Interface Cuisine"
                      >
                        <ChefHat className="size-4 shrink-0" />
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-sans text-xs">
                    Interface Cuisine
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link href="/eats/kitchen">
                  <div
                    className={cn(
                      "flex items-center gap-2.5 h-8 rounded-md px-2.5 text-[13px] font-medium transition-colors duration-150",
                      pathname.startsWith("/eats/kitchen")
                        ? "bg-orange-600/10 text-orange-600"
                        : "text-[oklch(0.45_0.04_260)] hover:bg-white/5 hover:text-foreground",
                    )}
                  >
                    <ChefHat className="size-4 shrink-0" />
                    <span>Interface Cuisine</span>
                  </div>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Bottom actions */}
        <div className="h-px bg-sidebar-border shrink-0" />
        <div className="px-1.5 py-2 space-y-0.5 shrink-0">
          {/* Theme toggle */}
          <div className={cn("flex", collapsed ? "justify-center" : "")}>
            <ThemeToggle compact collapsed={collapsed} />
          </div>

          {/* Settings */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/settings">
                  <div
                    className={cn(
                      "flex items-center justify-center h-8 w-8 mx-auto rounded-md transition-colors duration-150",
                      pathname === "/settings"
                        ? "bg-[#B01817]/10 text-[#B01817]"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    )}
                    aria-label="Paramètres"
                  >
                    <Settings className="size-4 shrink-0" />
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-sans text-xs">
                Paramètres
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link href="/settings">
              <div className="flex items-center gap-2.5 h-8 rounded-md px-2.5 text-[13px] text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors duration-150">
                <Settings className="size-4 shrink-0" />
                <span>Paramètres</span>
              </div>
            </Link>
          )}

          {/* Logout */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  aria-label="Déconnexion"
                  className="flex items-center justify-center h-8 w-8 mx-auto rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-150"
                >
                  <LogOut className="size-4 shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-sans text-xs">
                Déconnexion
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 h-8 rounded-md px-2.5 text-[13px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-150"
            >
              <LogOut className="size-4 shrink-0" />
              <span>Déconnexion</span>
            </button>
          )}

          {/* Collapse toggle */}
          <div className="h-px bg-sidebar-border my-1" />
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleCollapsed}
                aria-label={
                  collapsed
                    ? "Ouvrir la barre latérale"
                    : "Réduire la barre latérale"
                }
                className={cn(
                  "flex items-center h-8 rounded-md text-[13px] text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors duration-150",
                  collapsed
                    ? "justify-center w-8 mx-auto"
                    : "w-full gap-2.5 px-2.5",
                )}
              >
                {collapsed ? (
                  <ChevronRight className="size-4 shrink-0" />
                ) : (
                  <>
                    <ChevronLeft className="size-4 shrink-0" />
                    <span>Réduire</span>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground/50">
                      ⌘B
                    </span>
                  </>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-sans text-xs">
              {collapsed ? "Ouvrir (⌘B)" : "Réduire (⌘B)"}
            </TooltipContent>
          </Tooltip>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
