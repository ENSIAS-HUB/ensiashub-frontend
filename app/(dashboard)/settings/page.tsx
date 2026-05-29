"use client";

import { useRef, useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  GraduationCap,
  BookOpen,
  Shield,
  LogOut,
  Save,
  Loader2,
  Lock,
  Bell,
  Palette,
  ChevronRight,
  Eye,
  KeyRound,
  AlertTriangle,
  Monitor,
  Moon,
  Sun,
  Camera,
  CheckCircle2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/store/authStore";
import { logout as apiLogout } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import apiClient from "@/lib/api/client";
import { cn, getStorageUrl } from "@/lib/utils";
import { useTheme } from "next-themes";
import {
  useUpdateProfile,
  useUpdateAvatar,
  useDeleteAvatar,
  useChangePassword,
} from "@/lib/hooks/useProfile";
import type { RoleType, User } from "@/lib/types";

// ─── Role badge config ────────────────────────────────────────────────────────

type RoleConfig = { label: string; className: string };

const ROLE_CONFIG: Record<string, RoleConfig> = {
  superAdmin: {
    label: "Super Admin",
    className:
      "bg-gradient-to-r from-red-500/20 to-amber-500/20 text-amber-300 border-amber-500/40",
  },
  admin: {
    label: "Administrateur",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  etudiant: {
    label: "Étudiant",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  delegue: {
    label: "Délégué",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  chef_scolarite: {
    label: "Chef Scolarité",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  scolarite: {
    label: "Scolarité",
    className: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  president_club: {
    label: "Président Club",
    className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  buvette: {
    label: "Buvette",
    className: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  },
};

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CONFIG[role] ?? {
    label: role,
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full border",
        cfg.className,
      )}
    >
      <Shield className="size-2.5 mr-1 inline-block opacity-70" />
      {cfg.label}
    </Badge>
  );
}

// ─── Profile completion ───────────────────────────────────────────────────────

function ProfileCompletion({
  hasRealAvatar,
  bio,
  username,
  filiere,
  annee,
}: {
  hasRealAvatar: boolean;
  bio?: string | null;
  username?: string | null;
  filiere?: string | null;
  annee?: string | null;
}) {
  const fields = [
    { label: "Avatar", done: hasRealAvatar },
    { label: "Bio", done: !!(bio && bio.length > 0) },
    { label: "Pseudo", done: !!(username && username.length > 0) },
    { label: "Filière", done: !!filiere },
    { label: "Année", done: !!annee },
  ];
  const pct = Math.round(
    (fields.filter((f) => f.done).length / fields.length) * 100,
  );
  const color =
    pct < 40 ? "bg-red-500" : pct < 80 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Complétion du profil
        </span>
        <span
          className={cn(
            "text-xs font-semibold tabular-nums",
            pct === 100 ? "text-emerald-400" : "text-foreground",
          )}
        >
          {pct === 100 ? (
            <>
              <CheckCircle2 className="inline size-3 mr-1" />
              Complet
            </>
          ) : (
            `${pct}%`
          )}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {fields.map((f) => (
          <span
            key={f.label}
            className={cn(
              "inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md",
              f.done
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-muted/60 text-muted-foreground/60",
            )}
          >
            {f.done ? "✓" : "✗"} {f.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-[#B01817]" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}

function FieldGroup({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  );
}

function CardSection({
  title,
  description,
  children,
  danger = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border bg-card",
        danger ? "border-red-500/25" : "border-border",
      )}
    >
      <div
        className={cn("px-5 pt-5 pb-3", danger && "border-b border-red-500/20")}
      >
        <h3
          className={cn(
            "text-sm font-semibold",
            danger ? "text-red-400" : "text-foreground",
          )}
        >
          {title}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="px-5 pb-5 pt-4 space-y-5">{children}</div>
    </section>
  );
}

function NotificationRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

function StyledSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#B01817] transition-colors appearance-none cursor-pointer"
      style={{ backgroundImage: "none" }}
    >
      {options.map((opt) => (
        <option
          key={opt.value}
          value={opt.value}
          className="bg-card text-foreground"
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ─── Password strength ────────────────────────────────────────────────────────

function passwordStrength(pw: string): {
  label: string;
  color: string;
  width: string;
} {
  if (pw.length === 0) return { label: "", color: "", width: "0%" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Faible", color: "bg-red-500", width: "25%" };
  if (score <= 3)
    return { label: "Moyen", color: "bg-amber-500", width: "60%" };
  return { label: "Fort", color: "bg-emerald-500", width: "100%" };
}

/** Returns true only when the URL points to a real uploaded/OAuth photo,
 *  not a generated initials/placeholder avatar. */
function isRealAvatar(url?: string | null): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    !lower.includes("ui-avatars.com") &&
    !lower.includes("placeholder") &&
    !lower.includes("initials") &&
    !lower.includes("/avatar?name=")
  );
}

// ─── Tab panels ───────────────────────────────────────────────────────────────

function AccountTab({
  user,
  onLogout,
}: {
  user: User | null;
  onLogout: () => void;
}) {
  const { setAuth, token } = useAuthStore();
  const queryClient = useQueryClient();

  // ── Avatar state ──────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const avatarSrc =
    avatarPreview ??
    getStorageUrl(user?.avatar_url ?? user?.avatar) ??
    undefined;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "EH";

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setPendingFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    },
    [],
  );

  const updateAvatarMutation = useUpdateAvatar();
  const deleteAvatarMutation = useDeleteAvatar();

  const handleSaveAvatar = async () => {
    if (!pendingFile) return;
    const result = await updateAvatarMutation.mutateAsync(pendingFile);
    if (token && user) {
      setAuth({ ...user, avatar_url: result.avatar_url }, token);
    }
    setPendingFile(null);
    setAvatarPreview(null);
  };

  const handleDeleteAvatar = async () => {
    await deleteAvatarMutation.mutateAsync();
    if (token && user) {
      setAuth({ ...user, avatar_url: null }, token);
    }
  };

  // ── Profile fields ────────────────────────────────────────────────
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [profileDirty, setProfileDirty] = useState(false);

  const updateProfileMutation = useUpdateProfile();

  const handleSaveProfile = async () => {
    const result = await updateProfileMutation.mutateAsync({
      username: username || undefined,
      bio,
    });
    if (token && user && result?.user) {
      setAuth(
        { ...user, username: result.user.username, bio: result.user.bio },
        token,
      );
    }
    setProfileDirty(false);
  };

  // ── Password ──────────────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMismatch, setPwMismatch] = useState(false);
  const strength = passwordStrength(newPw);

  const changePasswordMutation = useChangePassword();

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) {
      setPwMismatch(true);
      return;
    }
    setPwMismatch(false);
    await changePasswordMutation.mutateAsync({
      current_password: currentPw,
      new_password: newPw,
      new_password_confirmation: confirmPw,
    });
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  };

  return (
    <div className="space-y-5">
      {/* ── Identity card ── */}
      <CardSection
        title="Profil"
        description="Gérez vos informations personnelles et la complétion de votre profil."
      >
        {/* Avatar row with upload overlay */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="relative group">
              <Avatar className="size-16 ring-2 ring-[#B01817]/30">
                <AvatarImage src={avatarSrc} alt={user?.name} />
                <AvatarFallback className="bg-[#B01817]/15 text-[#B01817] text-base font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Hover overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Changer l'avatar"
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
              >
                <Camera className="size-5 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
              />
            </div>
            {/* Delete photo link — only shown when user has a real uploaded photo */}
            {isRealAvatar(user?.avatar_url) && !pendingFile && (
              <button
                type="button"
                disabled={deleteAvatarMutation.isPending}
                onClick={handleDeleteAvatar}
                className="text-[10px] text-muted-foreground/50 hover:text-red-400 disabled:opacity-40 transition-colors leading-none"
              >
                {deleteAvatarMutation.isPending
                  ? "Suppression…"
                  : "Supprimer la photo"}
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <p className="font-semibold text-sm text-foreground">
              {user?.name ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {user?.email}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <RoleBadge role={user?.role ?? "etudiant"} />
              {user?.roles &&
                user.roles.length > 1 &&
                user.roles
                  .slice(1)
                  .map((r: RoleType) => <RoleBadge key={r} role={r} />)}
            </div>
          </div>
        </div>

        {/* Avatar save row */}
        {pendingFile && (
          <div className="flex items-center gap-3 rounded-lg border border-[#B01817]/30 bg-[#B01817]/5 px-3 py-2.5">
            <p className="flex-1 text-xs text-muted-foreground">
              Nouvelle image sélectionnée — cliquez Enregistrer pour confirmer.
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-muted-foreground"
                onClick={() => {
                  setPendingFile(null);
                  setAvatarPreview(null);
                }}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs gap-1.5 bg-[#B01817] hover:bg-[#8f1211] text-white"
                disabled={updateAvatarMutation.isPending}
                onClick={handleSaveAvatar}
              >
                {updateAvatarMutation.isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Save className="size-3" />
                )}
                Enregistrer l&apos;avatar
              </Button>
            </div>
          </div>
        )}

        <Separator className="opacity-40" />

        {/* Profile completion bar */}
        <ProfileCompletion
          hasRealAvatar={
            !!avatarPreview ||
            isRealAvatar(user?.avatar_url) ||
            isRealAvatar(user?.avatar)
          }
          bio={bio}
          username={username}
          filiere={user?.filiere}
          annee={user?.annee}
        />

        <Separator className="opacity-40" />

        {/* Nom affiché (username) */}
        <FieldGroup
          label="Pseudo / Nom affiché"
          description="Votre identifiant public sur la plateforme."
        >
          <div className="relative flex items-center">
            <UserIcon className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setProfileDirty(true);
              }}
              placeholder="votre-pseudo"
              className="w-full rounded-lg border border-border bg-card pl-9 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[#B01817] transition-colors"
            />
          </div>
        </FieldGroup>

        {/* Bio */}
        <FieldGroup label="Bio" description="Visible sur votre profil public.">
          <Textarea
            value={bio}
            onChange={(e) => {
              setBio(e.target.value.slice(0, 160));
              setProfileDirty(true);
            }}
            placeholder="Décrivez-vous en quelques mots…"
            rows={4}
            maxLength={160}
            className="resize-y text-sm bg-muted/30 border-border focus-visible:ring-[#B01817]"
          />
          <p
            className={cn(
              "text-xs tabular-nums mt-1",
              bio.length >= 150
                ? "text-red-400"
                : bio.length >= 130
                  ? "text-amber-400"
                  : "text-muted-foreground",
            )}
          >
            {bio.length} / 160
          </p>
        </FieldGroup>

        {/* Save entire profile block (username + bio) */}
        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            disabled={!profileDirty || updateProfileMutation.isPending}
            onClick={handleSaveProfile}
            className="h-8 text-xs gap-1.5 bg-[#B01817] hover:bg-[#8f1211] text-white disabled:opacity-40"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                Enregistrement…
              </>
            ) : (
              <>
                <Save className="size-3" />
                Enregistrer le profil
              </>
            )}
          </Button>
        </div>
      </CardSection>

      {/* ── Academic info (read-only) ── */}
      <CardSection
        title="Informations académiques"
        description="Gérées par la scolarité. Non modifiables directement."
      >
        {/* Email */}
        <FieldGroup label="Email académique">
          <div className="relative flex items-center">
            <Mail className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              readOnly
              value={user?.email ?? ""}
              className="w-full rounded-lg border border-border bg-muted/40 pl-9 pr-9 py-2 text-sm text-muted-foreground cursor-not-allowed select-none focus:outline-none"
            />
            <Lock className="absolute right-3 size-3 text-muted-foreground/50 pointer-events-none" />
          </div>
        </FieldGroup>

        {/* Filière + Année */}
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup label="Filière">
            <div className="relative flex items-center">
              <BookOpen className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
              <input
                readOnly
                value={user?.filiere ?? "—"}
                className="w-full rounded-lg border border-border bg-muted/40 pl-9 pr-9 py-2 text-sm text-muted-foreground cursor-not-allowed select-none focus:outline-none"
              />
              <Lock className="absolute right-3 size-3 text-muted-foreground/50 pointer-events-none" />
            </div>
          </FieldGroup>
          <FieldGroup label="Année d'étude">
            <div className="relative flex items-center">
              <GraduationCap className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
              <input
                readOnly
                value={user?.annee ?? "—"}
                className="w-full rounded-lg border border-border bg-muted/40 pl-9 pr-9 py-2 text-sm text-muted-foreground cursor-not-allowed select-none focus:outline-none"
              />
              <Lock className="absolute right-3 size-3 text-muted-foreground/50 pointer-events-none" />
            </div>
          </FieldGroup>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
          <Lock className="size-3 shrink-0" />
          Ces informations sont gérées par la scolarité. Contactez un
          responsable pour toute modification.
        </p>
      </CardSection>

      {/* ── Password change ── */}
      <CardSection
        title="Sécurité"
        description="Mettez à jour votre mot de passe de connexion."
      >
        <FieldGroup label="Mot de passe actuel">
          <div className="relative flex items-center">
            <KeyRound className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Mot de passe actuel"
              className="w-full rounded-lg border border-border bg-card pl-9 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[#B01817] transition-colors"
            />
          </div>
        </FieldGroup>

        <div className="grid grid-cols-2 gap-3">
          <FieldGroup label="Nouveau mot de passe">
            <input
              type="password"
              value={newPw}
              onChange={(e) => {
                setNewPw(e.target.value);
                setPwMismatch(false);
              }}
              placeholder="Nouveau mot de passe"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[#B01817] transition-colors"
            />
          </FieldGroup>
          <FieldGroup label="Confirmer">
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => {
                setConfirmPw(e.target.value);
                setPwMismatch(false);
              }}
              placeholder="Confirmer le mot de passe"
              className={cn(
                "w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 transition-colors",
                pwMismatch
                  ? "border-red-500/60 focus:ring-red-500"
                  : "border-border focus:ring-[#B01817]",
              )}
            />
          </FieldGroup>
        </div>

        {/* Password strength indicator */}
        {newPw.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Force du mot de passe
              </span>
              <span className="text-xs font-medium text-foreground">
                {strength.label}
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full transition-all",
                  strength.color,
                )}
                initial={{ width: 0 }}
                animate={{ width: strength.width }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {pwMismatch && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertTriangle className="size-3" />
            Les deux mots de passe ne correspondent pas.
          </p>
        )}

        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs border-border hover:bg-muted gap-1.5 disabled:opacity-40"
          disabled={
            !currentPw ||
            !newPw ||
            !confirmPw ||
            changePasswordMutation.isPending
          }
          onClick={handleChangePassword}
        >
          {changePasswordMutation.isPending ? (
            <>
              <Loader2 className="size-3 animate-spin" />
              Mise à jour…
            </>
          ) : (
            <>
              <KeyRound className="size-3" />
              Mettre à jour le mot de passe
            </>
          )}
        </Button>
      </CardSection>

      {/* ── Session ── */}
      <CardSection title="Session" description="Gérez votre connexion active.">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Se déconnecter
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ferme votre session sur cet appareil.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onLogout}
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 h-8 text-xs"
          >
            <LogOut className="size-3" />
            Déconnexion
          </Button>
        </div>
      </CardSection>

      {/* ── Danger zone ── */}
      <CardSection
        title="Zone de danger"
        description="Ces actions sont irréversibles. Procédez avec prudence."
        danger
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Désactiver le compte
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Votre compte sera suspendu et vos données conservées pendant 30
              jours.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs shrink-0 gap-1.5 text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
            onClick={() =>
              toast.error(
                "Action désactivée en environnement de démonstration.",
              )
            }
          >
            <AlertTriangle className="size-3" />
            Désactiver
          </Button>
        </div>
      </CardSection>
    </div>
  );
}

function PrivacyTab() {
  const [profileVisibility, setProfileVisibility] = useState("members");
  const [searchable, setSearchable] = useState("all");
  const [showEmail, setShowEmail] = useState(false);
  const [showFiliere, setShowFiliere] = useState(true);

  return (
    <div className="space-y-5">
      <CardSection
        title="Visibilité du profil"
        description="Contrôlez qui peut voir votre profil et vos informations."
      >
        <FieldGroup
          label="Qui peut voir mon profil ?"
          description="Définit l'audience de votre page publique."
        >
          <StyledSelect
            value={profileVisibility}
            onChange={setProfileVisibility}
            options={[
              { value: "everyone", label: "Tout le monde" },
              { value: "members", label: "Membres ENSIAS uniquement" },
              { value: "nobody", label: "Personne (profil masqué)" },
            ]}
          />
        </FieldGroup>

        <Separator className="opacity-40" />

        <FieldGroup
          label="Apparaître dans les recherches"
          description="Permet à d'autres membres de vous trouver par nom."
        >
          <StyledSelect
            value={searchable}
            onChange={setSearchable}
            options={[
              { value: "all", label: "Tous les membres" },
              { value: "promo", label: "Ma promotion uniquement" },
              { value: "disabled", label: "Désactivé" },
            ]}
          />
        </FieldGroup>
      </CardSection>

      <CardSection
        title="Informations exposées"
        description="Choisissez les données visibles sur votre profil public."
      >
        <div className="space-y-4">
          <NotificationRow
            label="Adresse email"
            description="Afficher votre email académique sur votre profil."
            checked={showEmail}
            onChange={setShowEmail}
          />
          <Separator className="opacity-30" />
          <NotificationRow
            label="Filière & Année"
            description="Afficher votre parcours académique."
            checked={showFiliere}
            onChange={setShowFiliere}
          />
        </div>
      </CardSection>
    </div>
  );
}

function NotificationsTab() {
  const [notifs, setNotifs] = useState({
    drive: true,
    adei: true,
    groups: false,
    eats: true,
    iot: false,
    mentions: true,
    newsletter: false,
  });

  const toggle = (key: keyof typeof notifs) =>
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-5">
      <CardSection
        title="Notifications push"
        description="Recevez des alertes en temps réel sur vos activités ENSIAS Hub."
      >
        <div className="space-y-4">
          <NotificationRow
            label="Nouveaux documents Drive"
            description="Alertes lors de l'ajout de ressources pédagogiques."
            checked={notifs.drive}
            onChange={() => toggle("drive")}
          />
          <Separator className="opacity-30" />
          <NotificationRow
            label="Annonces ADEI"
            description="Actualités et communications officielles de l'association."
            checked={notifs.adei}
            onChange={() => toggle("adei")}
          />
          <Separator className="opacity-30" />
          <NotificationRow
            label="Activité de mes groupes"
            description="Nouveaux posts et messages dans vos groupes."
            checked={notifs.groups}
            onChange={() => toggle("groups")}
          />
          <Separator className="opacity-30" />
          <NotificationRow
            label="Notifications Ensias Eats"
            description="Mises à jour du menu cafétéria et commandes."
            checked={notifs.eats}
            onChange={() => toggle("eats")}
          />
        </div>
      </CardSection>

      <CardSection
        title="Smart Campus"
        description="Données capteurs et alertes environnementales du campus."
      >
        <div className="space-y-4">
          <NotificationRow
            label="Alertes IoT campus"
            description="Anomalies détectées par les capteurs (température, CO₂…)."
            checked={notifs.iot}
            onChange={() => toggle("iot")}
          />
        </div>
      </CardSection>

      <CardSection
        title="Social"
        description="Interactions et communications directes."
      >
        <div className="space-y-4">
          <NotificationRow
            label="Mentions & réponses"
            description="Quand quelqu'un vous mentionne dans un post."
            checked={notifs.mentions}
            onChange={() => toggle("mentions")}
          />
          <Separator className="opacity-30" />
          <NotificationRow
            label="Newsletter hebdomadaire"
            description="Résumé des événements et ressources de la semaine."
            checked={notifs.newsletter}
            onChange={() => toggle("newsletter")}
          />
        </div>
      </CardSection>
    </div>
  );
}

function AppearanceTab() {
  const { theme, setTheme } = useTheme();

  const modes = [
    {
      value: "light",
      label: "Clair",
      icon: Sun,
      description: "Interface lumineuse",
    },
    {
      value: "dark",
      label: "Sombre",
      icon: Moon,
      description: "Interface sombre",
    },
    {
      value: "system",
      label: "Système",
      icon: Monitor,
      description: "Suit votre OS",
    },
  ] as const;

  return (
    <div className="space-y-5">
      <CardSection
        title="Thème"
        description="Choisissez l'apparence de l'interface ENSIAS Hub."
      >
        <div className="grid grid-cols-3 gap-3">
          {modes.map(({ value, label, icon: Icon, description }) => {
            const active = theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={cn(
                  "relative flex flex-col items-center gap-2.5 rounded-xl border p-4 text-center transition-all duration-150",
                  active
                    ? "border-[#B01817]/60 bg-[#B01817]/8 ring-1 ring-[#B01817]/30"
                    : "border-border hover:border-border/80 hover:bg-muted/50",
                )}
              >
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg",
                    active
                      ? "bg-[#B01817]/15 text-[#B01817]"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      active ? "text-[#B01817]" : "text-foreground",
                    )}
                  >
                    {label}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {description}
                  </p>
                </div>
                {active && (
                  <span className="absolute top-2.5 right-2.5 flex size-2 rounded-full bg-[#B01817]" />
                )}
              </button>
            );
          })}
        </div>
      </CardSection>

      <CardSection
        title="Accessibilité"
        description="Ajustements pour améliorer votre confort visuel."
      >
        <div className="space-y-4">
          <NotificationRow
            label="Réduire les animations"
            description="Désactive les transitions et animations de l'interface."
            checked={false}
            onChange={() => toast.info("Fonctionnalité à venir.")}
          />
          <Separator className="opacity-30" />
          <NotificationRow
            label="Mode contraste élevé"
            description="Augmente le contraste pour une meilleure lisibilité."
            checked={false}
            onChange={() => toast.info("Fonctionnalité à venir.")}
          />
        </div>
      </CardSection>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

type TabId = "account" | "privacy" | "notifications" | "appearance";

const NAV_ITEMS: {
  id: TabId;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    id: "account",
    label: "Mon Compte",
    icon: UserIcon,
    description: "Profil, bio, sécurité",
  },
  {
    id: "privacy",
    label: "Confidentialité",
    icon: Eye,
    description: "Visibilité, accès",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Alertes, préférences",
  },
  {
    id: "appearance",
    label: "Apparence",
    icon: Palette,
    description: "Thème, affichage",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>("account");

  const handleLogout = async () => {
    try {
      await apiLogout();
    } finally {
      logout();
      router.push("/login");
    }
  };

  const activeNav = NAV_ITEMS.find((n) => n.id === activeTab)!;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-foreground">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gérez votre compte, votre confidentialité et vos préférences.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        {/* ── Left sidebar nav ── */}
        <nav className="hidden md:flex flex-col w-52 shrink-0 gap-0.5 sticky top-6">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors duration-150",
                  active
                    ? "bg-[#B01817]/10 text-[#B01817]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    active
                      ? "text-[#B01817]"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span className="text-sm font-medium">{label}</span>
                {active && (
                  <ChevronRight className="ml-auto size-3 text-[#B01817]/60" />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Right content ── */}
        <div className="flex-1 min-w-0">
          {/* Mobile tabs */}
          <div className="mb-4 flex items-center gap-2 md:hidden overflow-x-auto pb-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  activeTab === id
                    ? "bg-[#B01817]/10 text-[#B01817]"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Content heading */}
          <div className="mb-5 hidden md:block">
            <div className="flex items-center gap-2">
              <activeNav.icon className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">
                {activeNav.label}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeNav.description}
            </p>
          </div>

          {/* Animated panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {activeTab === "account" && (
                <AccountTab user={user} onLogout={handleLogout} />
              )}
              {activeTab === "privacy" && <PrivacyTab />}
              {activeTab === "notifications" && <NotificationsTab />}
              {activeTab === "appearance" && <AppearanceTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
