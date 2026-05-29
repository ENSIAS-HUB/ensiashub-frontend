"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GraduationCap, BookOpen, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/lib/store/authStore";
import type { User } from "@/lib/types";
import apiClient from "@/lib/api/client";

const FILIERES = [
  "GL",
  "GD",
  "D2S",
  "2IA",
  "2SCL",
  "SSE",
  "CSCMC",
  "IDF",
  "BI&A",
];
const ANNEES = [
  { value: "1A", label: "1ère année" },
  { value: "2A", label: "2ème année" },
  { value: "3A", label: "3ème année" },
];

function CompleteProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [filiere, setFiliere] = useState("");
  const [annee, setAnnee] = useState("");
  const [loading, setLoading] = useState(false);

  // Token passed in query params from backend redirect
  const token = searchParams.get("token") ?? "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filiere || !annee) {
      toast.error("Veuillez sélectionner votre filière et votre année.");
      return;
    }
    if (!token) {
      toast.error("Session invalide. Veuillez vous reconnecter.");
      router.replace("/login");
      return;
    }

    setLoading(true);
    try {
      await apiClient.patch(
        "/me/complete-profile",
        { filiere, annee },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Fetch the freshly-updated user from /me
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api";
      const meRes = await fetch(`${base}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!meRes.ok) throw new Error("Unable to fetch user");
      const payload = await meRes.json();
      const raw = payload?.data ?? payload;
      const updatedUser: User = {
        id: raw.id,
        name: raw.name ?? `${raw.prenom ?? ""} ${raw.nom ?? ""}`.trim(),
        email: raw.email ?? raw.emailInstitutionnel,
        avatar: raw.avatar ?? raw.photoProfil ?? null,
        role:
          raw.role ??
          (Array.isArray(raw.roles) ? raw.roles[0] : raw.roles) ??
          "etudiant",
        filiere: raw.filiere ?? filiere,
        annee: raw.annee ?? annee,
      } as User;

      setAuth(updatedUser, token);
      window.history.replaceState(null, "", "/complete-profile");

      toast.success(`Bienvenue dans le groupe ${filiere} ${annee} !`);
      router.replace("/feed");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (err instanceof Error
          ? err.message
          : "Une erreur est survenue. Veuillez réessayer.");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#B01817] shadow-lg">
            <span className="text-2xl font-black text-white">E</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">
              Complétez votre profil
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Sélectionnez votre filière et votre année pour rejoindre votre
              groupe.
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Filière */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300">
                <BookOpen className="size-3.5 text-[#B01817]" />
                Filière
              </label>
              <Select value={filiere} onValueChange={setFiliere}>
                <SelectTrigger className="h-10 bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Sélectionnez votre filière" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {FILIERES.map((f) => (
                    <SelectItem
                      key={f}
                      value={f}
                      className="text-white focus:bg-slate-700"
                    >
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Année */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300">
                <GraduationCap className="size-3.5 text-[#B01817]" />
                Année d&apos;étude
              </label>
              <Select value={annee} onValueChange={setAnnee}>
                <SelectTrigger className="h-10 bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Sélectionnez votre année" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {ANNEES.map((a) => (
                    <SelectItem
                      key={a.value}
                      value={a.value}
                      className="text-white focus:bg-slate-700"
                    >
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            {filiere && annee && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-lg bg-[#B01817]/10 border border-[#B01817]/20 px-4 py-3"
              >
                <p className="text-sm text-slate-300">
                  Vous serez inscrit dans le groupe{" "}
                  <span className="font-semibold text-white">
                    {filiere} {annee}
                  </span>
                </p>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={!filiere || !annee || loading}
              className="w-full h-10 bg-[#B01817] hover:bg-[#8f1211] text-white font-semibold gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Enregistrement…
                </>
              ) : (
                <>
                  Confirmer et accéder à ENSIAS Hub
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense>
      <CompleteProfileForm />
    </Suspense>
  );
}
