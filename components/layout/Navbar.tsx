'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, CheckCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/lib/store/authStore';
import { useNotificationStore } from '@/lib/store/notificationStore';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { logout as apiLogout } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const ROLE_LABELS: Record<string, string> = {
  etudiant:       'Étudiant',
  delegue:        'Délégué',
  chef_scolarite: 'Chef de Scolarité',
  president_club: 'Président de Club',
  admin:          'Admin',
};

const PAGE_TITLES: Record<string, string> = {
  '/feed':          'Feed',
  '/groups':        'Groupes',
  '/drive':         'The Drive',
  '/eats':          'ENSIAS Eats',
  '/smart-campus':  'Smart Campus',
  '/map':           'Carte',
  '/settings':      'Paramètres',
  '/admin':         'Admin Panel',
};

function getPageTitle(pathname: string): string {
  const exact = PAGE_TITLES[pathname];
  if (exact) return exact;
  const match = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k + '/'));
  return match ? match[1] : 'ENSIAS Hub';
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
  const { notifications, unreadCount, markAllRead } = useNotificationStore();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Start polling for new notifications
  useNotifications();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'EH';

  const roleLabel = user?.role ? (ROLE_LABELS[user.role] ?? user.role) : null;

  const handleLogout = async () => {
    try { await apiLogout(); } finally {
      logout();
      router.push('/login');
    }
  };

  const handleOpenSheet = (open: boolean) => {
    setSheetOpen(open);
    if (open && unreadCount > 0) markAllRead();
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-6">
      <motion.h1
        key={pathname}
        className="text-base font-semibold"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {getPageTitle(pathname)}
      </motion.h1>

      <div className="flex items-center gap-2">
        {/* Search */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex items-center gap-2 h-8 px-3 text-muted-foreground border border-border rounded-md text-xs hover:bg-muted"
        >
          <Search className="size-3.5" />
          <span>Rechercher</span>
          <kbd className="ml-2 text-[10px] bg-muted rounded px-1 py-0.5">⌘K</kbd>
        </Button>
        <Button variant="ghost" size="icon" className="size-8 sm:hidden">
          <Search className="size-4" />
        </Button>

        {/* Notification bell + Sheet */}
        <Sheet open={sheetOpen} onOpenChange={handleOpenSheet}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative size-8">
              <Bell className="size-4" />
              {unreadCount > 0 ? (
                <Badge className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px] font-bold bg-[#B01817] text-white border-0 rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              ) : (
                <>
                  <span className="absolute top-1 right-1 size-2 rounded-full bg-[#B01817] animate-ping opacity-60" />
                  <span className="absolute top-1 right-1 size-2 rounded-full bg-[#B01817]" />
                </>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-80 p-0 flex flex-col">
            <SheetHeader className="px-5 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-sm flex items-center gap-2">
                  <Bell className="size-4 text-[#B01817]" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge className="bg-[#B01817] text-white text-[10px] h-4 px-1.5 border-0">
                      {unreadCount}
                    </Badge>
                  )}
                </SheetTitle>
                {notifications.length > 0 && (
                  <Button
                    variant="ghost" size="sm"
                    className="h-7 text-xs gap-1.5 text-muted-foreground"
                    onClick={markAllRead}
                  >
                    <CheckCheck className="size-3.5" />
                    Tout lire
                  </Button>
                )}
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <Bell className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Tout est calme</p>
                  <p className="text-xs text-muted-foreground">Pas de nouvelles, bonnes nouvelles ! 🎉</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map((notif, i) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      <Link
                        href={notif.href}
                        onClick={() => setSheetOpen(false)}
                        className={cn(
                          'flex gap-3 px-5 py-3.5 border-b border-border/50 transition-colors hover:bg-muted/50',
                          !notif.read && 'bg-[#B01817]/5'
                        )}
                      >
                        {/* Unread dot */}
                        <span className={cn(
                          'mt-1.5 size-1.5 rounded-full shrink-0',
                          !notif.read ? 'bg-[#B01817]' : 'bg-transparent'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold leading-tight">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{notif.message}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(notif.created_at)}</p>
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
            <Button variant="ghost" size="icon" className="size-8 rounded-full">
              <Avatar className="size-7">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-[#B01817]/20 text-[#B01817] text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal pb-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              {roleLabel && (
                <Badge variant="outline" className="mt-1.5 text-[10px] h-4 px-1.5 border-[#B01817]/40 text-[#B01817]">
                  {roleLabel}
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}


