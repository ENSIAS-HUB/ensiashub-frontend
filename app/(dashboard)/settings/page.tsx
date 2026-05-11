'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/lib/store/authStore';
import { logout as apiLogout } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';
import { cn } from '@/lib/utils';

const ROLE_LABELS: Record<string, string> = {
  etudiant:       'Étudiant',
  delegue:        'Délégué',
  chef_scolarite: 'Chef de Scolarité',
  president_club: 'Président de Club',
  admin:          'Administrateur',
};

const ROLE_COLORS: Record<string, string> = {
  etudiant:       'bg-slate-500/20 text-slate-400 border-slate-500/30',
  delegue:        'bg-blue-500/20 text-blue-400 border-blue-500/30',
  chef_scolarite: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  president_club: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  admin:          'bg-red-500/20 text-red-400 border-red-500/30',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        {children}
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  locked,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  locked?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted mt-0.5">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value ?? '—'}</p>
      </div>
      {locked && <Lock className="size-3 text-muted-foreground/50 mt-2 shrink-0" />}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, setAuth, token } = useAuthStore();
  const [bio, setBio] = useState(user?.bio ?? '');
  const [dirty, setDirty] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'EH';

  // Mutation: update bio
  const updateMutation = useMutation({
    mutationFn: () => apiClient.patch('/me', { bio }),
    onSuccess: (res) => {
      const updated = res.data?.data;
      if (updated && token) {
        setAuth({ ...user!, ...updated }, token);
      }
      setDirty(false);
      toast.success('Bio mise à jour.');
    },
    onError: () => toast.error('Erreur lors de la mise à jour.'),
  });

  const handleLogout = async () => {
    try { await apiLogout(); } finally {
      logout();
      router.push('/login');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold">Paramètres</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Gérez votre profil et vos préférences.</p>
      </div>

      {/* Avatar + name */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
      >
        <Avatar className="size-16 ring-2 ring-[#B01817]/30">
          <AvatarImage src={user?.avatar ?? undefined} alt={user?.name} />
          <AvatarFallback className="bg-[#B01817]/20 text-[#B01817] text-lg font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base">{user?.name ?? 'Étudiant'}</p>
          <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          <div className="mt-2">
            <Badge
              variant="outline"
              className={cn('text-[10px] border', ROLE_COLORS[user?.role ?? 'etudiant'])}
            >
              {ROLE_LABELS[user?.role ?? 'etudiant'] ?? user?.role}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Informations académiques */}
      <Section title="Informations académiques">
        <InfoRow icon={BookOpen}     label="Filière"          value={user?.filiere} locked />
        <Separator className="opacity-50" />
        <InfoRow icon={GraduationCap} label="Année d'étude"   value={user?.annee}   locked />
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Lock className="size-3" />
          Ces informations sont définies par l&apos;administration et ne peuvent pas être modifiées.
        </p>
      </Section>

      {/* Informations de compte */}
      <Section title="Compte">
        <InfoRow icon={Mail}     label="Email institutionnel" value={user?.email} locked />
        <Separator className="opacity-50" />
        <InfoRow icon={Shield}   label="Rôle"                 value={ROLE_LABELS[user?.role ?? 'etudiant']} locked />
      </Section>

      {/* Bio */}
      <Section title="À propos">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <UserIcon className="size-3.5 text-muted-foreground" />
            <label className="text-sm font-medium">Bio</label>
          </div>
          <Textarea
            value={bio}
            onChange={(e) => { setBio(e.target.value); setDirty(true); }}
            placeholder="Décrivez-vous en quelques mots…"
            maxLength={500}
            rows={3}
            className="resize-none text-sm bg-muted/30 border-border"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{bio.length}/500</p>
            <Button
              size="sm"
              disabled={!dirty || updateMutation.isPending}
              onClick={() => updateMutation.mutate()}
              className="h-8 text-xs gap-1.5 bg-[#B01817] hover:bg-[#8f1211] text-white disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <><Loader2 className="size-3 animate-spin" />Enregistrement…</>
              ) : (
                <><Save className="size-3" />Enregistrer</>
              )}
            </Button>
          </div>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Session">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Se déconnecter</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ferme votre session sur cet appareil.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleLogout}
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 h-8 text-xs"
          >
            <LogOut className="size-3" />
            Déconnexion
          </Button>
        </div>
      </Section>
    </div>
  );
}
