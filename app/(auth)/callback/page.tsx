'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/authStore';
import type { User } from '@/lib/types';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    const userRaw = searchParams.get('user');

    if (!token || !userRaw) {
      toast.error('Authentification échouée. Paramètres manquants.');
      router.replace('/login');
      return;
    }

    let user: User;
    try {
      user = JSON.parse(decodeURIComponent(userRaw)) as User;
    } catch {
      toast.error('Données utilisateur invalides.');
      router.replace('/login');
      return;
    }

    setAuth(user, token);
    localStorage.setItem('sanctum_token', token);
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
    router.replace('/feed');
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
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-[#B01817]/30 animate-ping" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#B01817] shadow-lg">
            <span className="text-2xl font-black text-white">E</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-white">ENSIAS Hub</p>
          <p className="mt-1 text-sm text-slate-400">Connexion en cours…</p>
        </div>
        <div className="h-1 w-48 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            className="h-full rounded-full bg-[#B01817]"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
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

