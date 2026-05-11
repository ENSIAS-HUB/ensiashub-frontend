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
  return (
    <DashboardGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
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
