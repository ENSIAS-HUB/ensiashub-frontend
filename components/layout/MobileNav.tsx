'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Users, BookOpen, UtensilsCrossed, Radio, Map, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const primaryNav = [
  { href: '/feed',         icon: Zap,             label: 'Feed' },
  { href: '/groups',       icon: Users,           label: 'Groupes' },
  { href: '/drive',        icon: BookOpen,        label: 'Drive' },
  { href: '/eats',         icon: UtensilsCrossed, label: 'Eats' },
  { href: '/smart-campus', icon: Radio,           label: 'Campus' },
];

const secondaryNav = [
  { href: '/map', icon: Map, label: 'Carte' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label="Navigation mobile"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t bg-background/95 backdrop-blur-md md:hidden"
      style={{ borderColor: 'rgba(255,255,255,0.07)' }}
    >
      {primaryNav.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
          >
            <Icon
              className={cn('size-4 transition-colors', isActive ? 'text-[#B01817]' : 'text-muted-foreground')}
            />
            <span
              className={cn(
                'font-mono text-[9px] uppercase tracking-wide',
                isActive ? 'text-[#B01817]' : 'text-muted-foreground'
              )}
            >
              {label}
            </span>
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-[#B01817]" />
            )}
          </Link>
        );
      })}

      {/* More sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            aria-label="Plus d'options"
            className="flex flex-1 flex-col items-center justify-center gap-0.5 h-full rounded-none py-2 text-muted-foreground"
          >
            <MoreHorizontal className="size-4" />
            <span className="font-mono text-[9px] uppercase tracking-wide">Plus</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto pb-safe">
          <div className="grid grid-cols-3 gap-3 p-4">
            {secondaryNav.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}>
                <div className="flex flex-col items-center gap-2 rounded-lg surface-2 p-4 hover:border-white/14 transition-colors">
                  <Icon className="size-5 text-foreground" />
                  <span className="text-[12px] font-medium">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
