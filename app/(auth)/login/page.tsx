"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Zap,
  MonitorSpeaker,
  AlertCircle,
  User,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { AuthProviderButton } from "@/components/auth/AuthProviderButton";
import { getAuthRedirect } from "@/lib/api/auth";
import AuthLeftPanel from "@/components/auth/AuthLeftPanel";
import { useAuthStore } from "@/lib/store/authStore";
import type { User as AuthUser } from "@/lib/types";

const ALLOWED_DOMAIN = "@um5.ac.ma";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value: string) => {
    if (!value) return "";
    if (!value.endsWith(ALLOWED_DOMAIN)) {
      return `Seules les adresses ${ALLOWED_DOMAIN} sont autorisées`;
    }
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    setEmailError(validateEmail(val));
    setAuthError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setAuthError("");
  };

  const handleOAuth = (provider: "google" | "microsoft") => {
    window.location.href = getAuthRedirect(provider);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    if (!password) {
      setAuthError("Le mot de passe est requis");
      return;
    }

    setAuthError("");
    setIsLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api";
      const res = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Identifiants invalides");
      }
      setAuth(data.user as AuthUser, data.token as string);
      router.push("/feed");
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#020617]">
      {/* Pulsing red halo */}
      <div
        className="animate-pulse-glow pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(176,24,23,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Left panel — campus image (desktop only) */}
      <AuthLeftPanel />

      {/* Right panel — login form */}
      <div className="relative z-10 flex w-full lg:w-1/2 xl:w-2/5 flex-col items-center justify-start px-8 pt-6 pb-8 overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <motion.div
            className="flex flex-col items-center mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <img
              src="/images/ensias-hub-only-logo.png"
              alt="ENSIAS HUB logo"
              className="w-24 h-24 object-contain drop-shadow-2xl"
            />
            <div className="flex flex-col items-center gap-0.5 mt-3">
              <span className="text-white font-bold text-2xl tracking-[0.15em]">
                ENSIAS
              </span>
              <span className="text-[#B01817] font-bold text-lg tracking-[0.4em]">
                HUB
              </span>
            </div>
            <p className="text-white/40 text-sm mt-1">
              Votre écosystème étudiant
            </p>
          </motion.div>

          {/* Glass card */}
          <motion.div
            className="glass rounded-2xl p-8 space-y-6"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              delay: 0.1,
            }}
          >
            {/* Title */}
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white">Bienvenue</h2>
              <p className="text-sm text-white/50 mt-1">
                Accès réservé à la communauté{" "}
                <span className="text-[#D42B2A] font-medium">@um5.ac.ma</span>
              </p>
            </div>

            {/* Email + Password form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="text-xs text-white/60 mb-1 block"
                >
                  Email institutionnel
                </label>
                <div className="relative">
                  <User className="text-white/30 absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                  <input
                    id="email"
                    type="email"
                    placeholder="prenom_nom@um5.ac.ma"
                    value={email}
                    onChange={handleEmailChange}
                    autoComplete="email"
                    className="bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-3 pl-10 text-white placeholder:text-white/30 focus:border-red-500 focus:outline-none w-full text-sm"
                  />
                </div>
                {emailError && (
                  <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
                    <AlertCircle className="size-3 shrink-0" />
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  className="text-xs text-white/60 mb-1 block"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="text-white/30 absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    autoComplete="current-password"
                    className="bg-[#1a1f2e] border border-white/10 rounded-lg px-4 py-3 pl-10 pr-10 text-white placeholder:text-white/30 focus:border-red-500 focus:outline-none w-full text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Auth error */}
              {authError && (
                <p className="flex items-center gap-1.5 text-xs text-red-400">
                  <AlertCircle className="size-3 shrink-0" />
                  {authError}
                </p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 w-full transition-colors duration-200"
              >
                {isLoading ? "Connexion…" : "Se connecter"}
              </button>
            </form>

            {/* Separator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30">Ou continuer avec</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* OAuth buttons */}
            <div className="space-y-3">
              <AuthProviderButton
                provider="google"
                label="Continuer avec Google"
                icon={Zap}
                onClick={() => handleOAuth("google")}
                variant="primary"
              />
              <AuthProviderButton
                provider="microsoft"
                label="Continuer avec Microsoft"
                icon={MonitorSpeaker}
                onClick={() => handleOAuth("microsoft")}
                variant="secondary"
              />
            </div>
          </motion.div>

          <p className="text-center text-xs text-white/30 mt-6">
            En vous connectant, vous acceptez les{" "}
            <span className="text-white/50 hover:text-white/70 cursor-pointer underline">
              conditions d&apos;utilisation
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
