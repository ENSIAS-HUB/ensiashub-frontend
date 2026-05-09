'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Zap,
  Users,
  BookOpen,
  UtensilsCrossed,
  Radio,
  Map,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/lib/store/authStore';
import { logout as apiLogout } from '@/lib/api/auth';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/feed',          icon: Zap,              label: 'Feed' },
  { href: '/groups',        icon: Users,            label: 'Groupes' },
  { href: '/drive',         icon: BookOpen,         label: 'The Drive' },
  { href: '/eats',          icon: UtensilsCrossed,  label: 'ENSIAS Eats' },
  { href: '/smart-campus',  icon: Radio,            label: 'Smart Campus' },
  { href: '/map',           icon: Map,              label: 'Carte' },
];

export function Sidebar() {
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
    <motion.aside
      className="flex h-full w-[240px] shrink-0 flex-col bg-sidebar border-r border-sidebar-border"
      initial={{ x: -240, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.05 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-[#B01817] shadow-[0_0_12px_rgba(176,24,23,0.4)]">
          <Zap className="size-4 text-white" fill="white" />
        </div>
        <span className="text-base font-bold tracking-tight">ENSIAS Hub</span>
      </div>

      <Separator className="opacity-50" />

      {/* User info */}
      <div className="flex items-center gap-3 px-4 py-4">
        <Avatar className="size-9 ring-2 ring-[#B01817]/30">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback className="bg-[#B01817]/20 text-[#B01817] text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight">{user?.name ?? 'Étudiant'}</p>
          {user?.filiere && (
            <p className="truncate text-xs text-muted-foreground">{user.filiere}</p>
          )}
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href}>
              <div
                className={cn(
                  'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#B01817]/15 text-[#B01817] border-l-[3px] border-[#B01817] pl-[9px]'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border-l-[3px] border-transparent'
                )}
              >
                <Icon className={cn('size-4 shrink-0 transition-colors', isActive ? 'text-[#B01817]' : '')} />
                {label}
              </div>
            </Link>
          );
        })}

        {user?.role === 'chef_scolarite' && (
          <>
            <Separator className="my-2 opacity-50" />
            <Link href="/admin">
              <div className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150 border-l-[3px] border-transparent',
                pathname.startsWith('/admin')
                  ? 'bg-[#B01817]/15 text-[#B01817] border-[#B01817]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}>
                <ShieldCheck className="size-4 shrink-0" />
                Admin Panel
              </div>
            </Link>
          </>
        )}
      </nav>

      {/* Bottom actions */}
      <Separator className="opacity-50" />
      <div className="px-2 py-3 space-y-0.5">
        <Link href="/settings">
          <div className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 border-l-[3px] border-transparent">
            <Settings className="size-4 shrink-0" />
            Paramètres
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150 border-l-[3px] border-transparent"
        >
          <LogOut className="size-4 shrink-0" />
          Déconnexion
        </button>
      </div>
    </motion.aside>
  );
}
