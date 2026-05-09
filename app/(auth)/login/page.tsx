'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, MonitorSpeaker, AlertCircle, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AuthProviderButton } from '@/components/auth/AuthProviderButton';
import { getAuthRedirect } from '@/lib/api/auth';
import { cn } from '@/lib/utils';

const ALLOWED_DOMAIN = '@um5.ac.ma';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  const validateEmail = (value: string) => {
    if (!value) return '';
    if (!value.endsWith(ALLOWED_DOMAIN)) {
      return `Seules les adresses ${ALLOWED_DOMAIN} sont autorisées`;
    }
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    setEmailError(validateEmail(val));
  };

  const handleOAuth = (provider: 'google' | 'microsoft') => {
    window.location.href = getAuthRedirect(provider);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) { setEmailError(error); return; }
    // Email auth — redirect to /feed after server-side token exchange
    router.push('/feed');
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#020617]">
      {/* Pulsing red halo */}
      <div
        className="animate-pulse-glow pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(176,24,23,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Left panel — campus image (desktop only) */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between overflow-hidden">
        {/* Darkened campus background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/campus.jpg')", filter: 'brightness(0.35)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#020617]/60" />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col h-full justify-end p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="size-8 text-[#B01817]" />
              <span className="text-white/70 text-sm font-medium uppercase tracking-widest">
                École Nationale Supérieure d'Informatique et d'Analyse des Systèmes
              </span>
            </div>
            <blockquote className="text-white text-2xl font-light leading-relaxed max-w-lg">
              "L'excellence n'est pas une destination, c'est un voyage continu vers la connaissance."
            </blockquote>
            <p className="mt-4 text-white/50 text-sm">— Communauté ENSIAS</p>
          </motion.div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="relative z-10 flex w-full lg:w-1/2 xl:w-2/5 flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <motion.div
            className="flex flex-col items-center mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#B01817] shadow-[0_0_32px_rgba(176,24,23,0.5)] mb-4">
              <Zap className="size-7 text-white" fill="white" />
            </div>
            <h1 className="text-2xl font-bold text-white">ENSIAS Hub</h1>
            <p className="text-sm text-white/50 mt-1">Votre écosystème étudiant</p>
          </motion.div>

          {/* Glass card */}
          <motion.div
            className="glass rounded-2xl p-8 space-y-6"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
          >
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white">Bienvenue</h2>
              <p className="text-sm text-white/50 mt-1">
                Accès réservé à la communauté{' '}
                <span className="text-[#D42B2A] font-medium">@um5.ac.ma</span>
              </p>
            </div>

            <div className="space-y-3">
              <AuthProviderButton
                provider="google"
                label="Continuer avec Google"
                icon={Zap}
                onClick={() => handleOAuth('google')}
                variant="primary"
              />
              <AuthProviderButton
                provider="microsoft"
                label="Continuer avec Microsoft"
                icon={MonitorSpeaker}
                onClick={() => handleOAuth('microsoft')}
                variant="secondary"
              />
              <AuthProviderButton
                provider="email"
                label="Email institutionnel"
                icon={Mail}
                onClick={() => setShowEmailForm((v) => !v)}
                variant="outline"
              />
            </div>

            {/* Email form — expandable */}
            <AnimatePresence>
              {showEmailForm && (
                <motion.form
                  onSubmit={handleEmailSubmit}
                  className="space-y-4 overflow-hidden"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-white/80 text-xs font-medium">
                        Adresse email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="prenom.nom@um5.ac.ma"
                        value={email}
                        onChange={handleEmailChange}
                        className={cn(
                          'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#B01817]',
                          emailError && 'border-destructive focus-visible:ring-destructive'
                        )}
                        autoComplete="email"
                      />
                      <AnimatePresence>
                        {emailError && (
                          <motion.p
                            className="flex items-center gap-1.5 text-xs text-destructive"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                          >
                            <AlertCircle className="size-3 shrink-0" />
                            {emailError}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <motion.div whileTap={{ scale: 0.96 }}>
                      <Button
                        type="submit"
                        className="w-full bg-[#B01817] hover:bg-[#D42B2A] text-white font-medium"
                        disabled={!!emailError || !email}
                      >
                        Continuer
                      </Button>
                    </motion.div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          <p className="text-center text-xs text-white/30 mt-6">
            En vous connectant, vous acceptez les{' '}
            <span className="text-white/50 hover:text-white/70 cursor-pointer underline">
              conditions d'utilisation
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
