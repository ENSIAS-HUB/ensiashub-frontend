"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import type { User } from "@/lib/types";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      toast.error("Authentification échouée. Token manquant.");
      router.replace("/login");
      return;
    }

    const hydrate = async () => {
      try {
        const base =
          process.env.NEXT_PUBLIC_API_URL || "https://api.ensiashub.me/api";
        const res = await fetch(`${base}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (!res.ok) {
          throw new Error("Unable to fetch user");
        }
        const payload = await res.json();
        // /me returns { success, data: UserResource }
        const raw = payload?.data ?? payload;
        const user: User = {
          id: raw.id,
          name: raw.name ?? `${raw.prenom ?? ""} ${raw.nom ?? ""}`.trim(),
          email: raw.email ?? raw.emailInstitutionnel,
          avatar: raw.avatar ?? raw.photoProfil ?? null,
          role:
            raw.role ??
            (Array.isArray(raw.roles) ? raw.roles[0] : raw.roles) ??
            "etudiant",
          filiere: raw.filiere ?? null,
          annee: raw.annee ?? null,
        } as User;

        setAuth(user, token);
        window.history.replaceState(null, "", "/feed");
        router.replace("/feed");
      } catch {
        toast.error("Impossible de récupérer le profil utilisateur.");
        router.replace("/login");
      }
    };

    hydrate();
  }, [searchParams, setAuth, router]);

  return null;
}

function Spinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="flex flex-col items-center gap-2">
          {/* Logo backflip */}
          <div className="logo-backflip">
            <img
              src="/images/ensias-hub-only-logo.png"
              alt="ENSIAS HUB"
              className="w-24 h-24 object-contain"
            />
          </div>

          {/* Ombre au sol */}
          <div className="logo-shadow w-16 h-2 rounded-full bg-red-900/40 blur-sm -mt-1" />

          {/* Texte */}
          <div className="flex flex-col items-center mt-4 gap-0.5">
            <p className="text-white font-bold text-lg tracking-widest">
              ENSIAS HUB
            </p>
            <p className="loading-text text-white/40 text-sm tracking-wider">
              Connexion en cours…
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="h-1 w-48 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            className="h-full rounded-full bg-[#B01817]"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <>
      <Suspense>
        <CallbackHandler />
      </Suspense>
      <Spinner />
    </>
  );
}
