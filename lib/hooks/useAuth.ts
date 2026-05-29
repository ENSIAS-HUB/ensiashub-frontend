"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { getMe, logout as apiLogout } from "@/lib/api/auth";

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cold-start: read token from localStorage (may differ from Zustand hydration timing)
    const storedToken =
      typeof window !== "undefined"
        ? localStorage.getItem("sanctum_token")
        : null;

    if (!storedToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    // Token present but user not yet in store → restore session
    if (!user) {
      getMe()
        .then((res) => {
          setAuth(res.data.data, storedToken);
        })
        .catch(() => {
          logout();
          router.push("/login");
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    try {
      await apiLogout();
    } finally {
      logout();
      router.push("/login");
    }
  };

  // ── Role helpers ──────────────────────────────────────────────────────
  const isSuperAdmin = user?.role === "superAdmin";
  const isAdminOrAbove = user?.role === "superAdmin" || user?.role === "admin";
  const isEtudiant = user?.role === "etudiant";
  const isDelegue = user?.role === "delegue";
  const isBuvette = false; // 'buvette' is not a role in the current system
  const isScolarite = user?.role === "chef_scolarite";
  const isPresidentClub = user?.role === "president_club";
  const isCuisinier = user?.role === "cuisinier";
  const canAccessKitchen = isCuisinier || isSuperAdmin;

  /** Est-il président du groupe `groupId` ? (via contextual_roles OU rôle global president_club) */
  const isPresidentOf = (groupId: string): boolean => {
    if (isSuperAdmin || isAdminOrAbove) return true;
    return (
      user?.contextual_roles?.some(
        (r) => r.role === "president_club" && r.context_id === groupId,
      ) ?? false
    );
  };

  /** Peut-il gérer les demandes d'adhésion du groupe `groupId` ? */
  const canReviewClub = (groupId: string): boolean => isPresidentOf(groupId);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    signOut,
    // role helpers
    isSuperAdmin,
    isAdminOrAbove,
    isEtudiant,
    isDelegue,
    isBuvette,
    isScolarite,
    isPresidentClub,
    isPresidentOf,
    canReviewClub,
    isCuisinier,
    canAccessKitchen,
  };
}
