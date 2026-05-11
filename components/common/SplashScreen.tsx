'use client';

import { motion } from 'framer-motion';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Logo */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#B01817]/20 animate-ping-slow" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#B01817]">
            <span className="text-2xl font-black text-white">E</span>
          </div>
        </div>

        {/* App name */}
        <div className="text-center">
          <p className="text-xl font-bold text-white">ENSIAS Hub</p>
          <p className="mt-1 text-sm text-slate-400">Chargement en cours…</p>
        </div>

        {/* Spinner bar */}
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
