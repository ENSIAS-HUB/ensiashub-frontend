import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  patchUser: (patch: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("sanctum_token", token);
          document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
        }
        set({ user, token, isAuthenticated: true });
      },
      patchUser: (patch) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : state.user,
        }));
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("sanctum_token");
          document.cookie = "token=; path=/; max-age=0";
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: "ensias-hub-auth" },
  ),
);
