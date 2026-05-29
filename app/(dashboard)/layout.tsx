'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { PageTransition } from '@/components/common/PageTransition';
import { DashboardGuard } from '@/components/common/DashboardGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme === 'dark';

  const overlayDark = `linear-gradient(
    160deg,
    rgba(0,0,0,0.82)    0%,
    rgba(8,11,16,0.87)  35%,
    rgba(10,13,18,0.91) 65%,
    rgba(10,13,18,0.94) 100%
  )`;

  const overlayLight = `linear-gradient(
    160deg,
    rgba(255,255,255,0.68) 0%,
    rgba(240,242,245,0.78) 35%,
    rgba(235,238,242,0.86) 65%,
    rgba(235,238,242,0.92) 100%
  )`;

  return (
    <DashboardGuard>
      <div className="flex h-screen overflow-hidden relative">

        {/* Image dark */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            backgroundImage: "url('/images/ensias-bg.jpeg')",
            backgroundSize: '85%',
            backgroundPosition: 'center 15%',
            opacity: isDark ? 1 : 0,
          }}
        />

        {/* Image light */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            backgroundImage: "url('/images/ensias-bg-white-mode.jpeg')",
            backgroundSize: '85%',
            backgroundPosition: 'center 15%',
            opacity: isDark ? 0 : 1,
          }}
        />

        {/* Overlay adaptatif */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{ background: isDark ? overlayDark : overlayLight }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(ellipse at center, transparent 40%, ${isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.10)'} 100%)`,
          }}
        />

        {/* Desktop sidebar */}
        <div className="hidden md:flex relative z-10">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden relative z-10">
          <Navbar />
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav />
      </div>
    </DashboardGuard>
  );
}