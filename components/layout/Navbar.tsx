'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/lib/store/authStore';
import { logout as apiLogout } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

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

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'EH';

  const handleLogout = async () => {
    try { await apiLogout(); } finally {
      logout();
      router.push('/login');
    }
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

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative size-8">
          <Bell className="size-4" />
          <span className="absolute top-1 right-1 size-2 rounded-full bg-[#B01817] animate-ping-slow" />
          <span className="absolute top-1 right-1 size-2 rounded-full bg-[#B01817]" />
        </Button>

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
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
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
