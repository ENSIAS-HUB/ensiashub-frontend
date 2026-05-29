"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import KitchenDashboard from "@/components/eats/kitchen/KitchenDashboard";

export default function KitchenPage() {
  const { isLoading, canAccessKitchen } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !canAccessKitchen) {
      router.replace("/");
    }
  }, [isLoading, canAccessKitchen, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-sm animate-pulse">
        Vérification des autorisations…
      </div>
    );
  }

  if (!canAccessKitchen) return null;

  return (
    <main className="px-4 py-6 max-w-screen-2xl mx-auto">
      <KitchenDashboard />
    </main>
  );
}
