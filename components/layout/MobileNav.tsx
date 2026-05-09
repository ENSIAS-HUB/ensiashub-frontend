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
  { href: '/map',      icon: Map,  label: 'Carte' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-background/95 backdrop-blur-sm md:hidden">
      {primaryNav.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link key={href} href={href} className="flex flex-1 flex-col items-center justify-center gap-1 py-2">
            <Icon className={cn('size-5 transition-colors', isActive ? 'text-[#B01817]' : 'text-muted-foreground')} />
            <span className={cn('text-[10px] font-medium', isActive ? 'text-[#B01817]' : 'text-muted-foreground')}>
              {label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-[#B01817]" />
            )}
          </Link>
        );
      })}

      {/* More sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="flex flex-1 flex-col items-center justify-center gap-1 h-full rounded-none py-2">
            <MoreHorizontal className="size-5 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">Plus</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto pb-safe">
          <div className="grid grid-cols-3 gap-4 p-4">
            {secondaryNav.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}>
                <div className="flex flex-col items-center gap-2 rounded-lg bg-muted p-4 hover:bg-muted/80 transition-colors">
                  <Icon className="size-6 text-foreground" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
