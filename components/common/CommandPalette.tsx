'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Zap, Users, BookOpen, UtensilsCrossed, Radio, Map,
  Settings, LogOut, Sun, Moon, Search,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/lib/store/authStore';
import { logout as apiLogout } from '@/lib/api/auth';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NAV_ITEMS = [
  { href: '/feed',          icon: Zap,             label: 'Feed' },
  { href: '/groups',        icon: Users,           label: 'Groupes' },
  { href: '/drive',         icon: BookOpen,        label: 'The Drive' },
  { href: '/eats',          icon: UtensilsCrossed, label: 'ENSIAS Eats' },
  { href: '/smart-campus',  icon: Radio,           label: 'Smart Campus' },
  { href: '/map',           icon: Map,             label: 'Carte' },
  { href: '/settings',      icon: Settings,        label: 'Paramètres' },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { logout } = useAuthStore();

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const handleNavigate = useCallback((href: string) => {
    onOpenChange(false);
    router.push(href);
  }, [onOpenChange, router]);

  const handleLogout = useCallback(async () => {
    onOpenChange(false);
    try { await apiLogout(); } finally {
      logout();
      router.push('/login');
    }
  }, [onOpenChange, logout, router]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-[520px] mx-4 rounded-xl overflow-hidden shadow-2xl"
        style={{
          background: 'var(--card)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className="flex flex-col"
          style={{ background: 'transparent' }}
          loop
        >
          {/* Input */}
          <div
            className="flex items-center gap-2.5 px-4 py-3 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <Search className="size-4 text-muted-foreground shrink-0" />
            <Command.Input
              placeholder="Rechercher ou naviguer..."
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none font-sans"
              autoFocus
            />
            <kbd
              className="font-mono text-[10px] text-muted-foreground/50 border rounded px-1.5 py-0.5 shrink-0"
              style={{ borderColor: 'rgba(255,255,255,0.12)' }}
            >
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[360px] overflow-y-auto py-2">
            <Command.Empty className="py-8 text-center text-[12px] text-muted-foreground">
              Aucun résultat trouvé.
            </Command.Empty>

            {/* Navigation */}
            <Command.Group
              heading="Navigation"
              className="px-2 pb-1"
            >
              <style>{`
                [cmdk-group-heading] {
                  padding: 4px 8px 6px;
                  font-family: var(--font-geist-mono), monospace;
                  font-size: 10px;
                  font-weight: 500;
                  text-transform: uppercase;
                  letter-spacing: 0.08em;
                  color: var(--muted-foreground);
                  opacity: 0.6;
                  user-select: none;
                }
                [cmdk-item] {
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  padding: 7px 10px;
                  border-radius: 6px;
                  font-size: 13px;
                  cursor: pointer;
                  transition: background 0.1s;
                  color: var(--foreground);
                  outline: none;
                }
                [cmdk-item][data-selected=true],
                [cmdk-item]:hover {
                  background: rgba(176,24,23,0.08);
                  color: var(--foreground);
                }
                [cmdk-item][data-selected=true] .cmd-icon,
                [cmdk-item]:hover .cmd-icon {
                  color: #B01817;
                }
              `}</style>
              {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
                <Command.Item
                  key={href}
                  value={label}
                  onSelect={() => handleNavigate(href)}
                >
                  <Icon className="cmd-icon size-4 text-muted-foreground shrink-0 transition-colors" />
                  <span>{label}</span>
                  <span
                    className="ml-auto font-mono text-[10px] text-muted-foreground/40"
                  >
                    {href}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Actions */}
            <Command.Group heading="Actions" className="px-2 pb-1">
              <Command.Item value="theme light clair" onSelect={() => { setTheme('light'); onOpenChange(false); }}>
                <Sun className="cmd-icon size-4 text-muted-foreground shrink-0" />
                <span>Thème clair</span>
              </Command.Item>
              <Command.Item value="theme dark sombre" onSelect={() => { setTheme('dark'); onOpenChange(false); }}>
                <Moon className="cmd-icon size-4 text-muted-foreground shrink-0" />
                <span>Thème sombre</span>
              </Command.Item>
              <Command.Item
                value="logout deconnexion"
                onSelect={handleLogout}
                className="text-destructive!"
              >
                <LogOut className="cmd-icon size-4 text-muted-foreground shrink-0" />
                <span className="text-destructive">Déconnexion</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
