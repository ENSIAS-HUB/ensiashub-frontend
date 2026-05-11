'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronDown, Zap } from 'lucide-react';

const NAV_LINKS = [
  'Modules', 'Vie Scolaire', 'Clubs', 'À propos'
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex flex-col">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 flex h-14 items-center 
        justify-between px-6 border-b border-white/8
        bg-black/85 backdrop-blur-md">

        {/* Left — Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center 
            rounded-lg bg-[#B01817] 
            shadow-[0_0_14px_rgba(176,24,23,0.55)]">
            <Zap className="size-4 text-white fill-white" />
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">
            ENSIAS Hub
          </span>
        </div>

        {/* Center — Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <button key={link}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md
                text-[13px] text-white/55 hover:text-white/90
                hover:bg-white/6 transition-all duration-150 font-medium">
              {link}
              <ChevronDown className="size-3 opacity-50" />
            </button>
          ))}
          <button className="px-3 py-1.5 rounded-md text-[13px] 
            text-white/55 hover:text-white/90 
            hover:bg-white/6 transition-all duration-150 font-medium">
            Contact
          </button>
        </nav>

        {/* Right — CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/login')}
            className="text-[13px] font-medium text-white/70 
              hover:text-white transition-colors px-2">
            Se connecter
          </button>
          <button
            onClick={() => router.push('/login')}
            className="h-8 px-4 rounded-md bg-[#B01817] 
              hover:bg-[#C41F1E] text-white text-[13px] 
              font-medium transition-colors">
            Rejoindre
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative flex-1 flex items-center 
        justify-center overflow-hidden"
        style={{ minHeight: 'calc(100vh - 56px)' }}>

        {/* Background image */}
        <Image
          src="/images/ensias-building.jpg"
          alt="ENSIAS Campus"
          fill
          priority
          className="object-cover"
          style={{ objectPosition: 'center 30%' }}
        />

        {/* 1. Base — moderate dark */}
        <div className="absolute inset-0 bg-black/52" />

        {/* 2. Strong top (hide grey sky) + strong bottom (hide steps) */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(to bottom,
            rgba(0,0,0,0.88) 0%,
            rgba(0,0,0,0.15) 25%,
            rgba(0,0,0,0.15) 55%,
            rgba(0,0,0,0.88) 80%,
            rgba(0,0,0,0.98) 100%
          )`
        }} />

        {/* 3. Side vignette */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(to right,
            rgba(0,0,0,0.75) 0%,
            transparent 22%,
            transparent 78%,
            rgba(0,0,0,0.75) 100%
          )`
        }} />

        {/* 4. Center blur on building text — makes "ENSIAS"
            on facade ghostly, not competing with title */}
        <div className="absolute inset-0" style={{
          background: `radial-gradient(
            ellipse 60% 40% at 50% 38%,
            rgba(0,0,0,0.45) 0%,
            transparent 100%
          )`
        }} />

        {/* ── HERO CONTENT ── */}
        <div className="relative z-10 flex flex-col 
          items-center text-center gap-7 px-6 
          mb-[72px]">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="flex items-center gap-2 px-3.5 py-1.5 
              rounded-full border border-[#B01817]/35 
              bg-[#B01817]/10 text-[#B01817] 
              text-[11px] font-mono tracking-[0.18em] uppercase">
            <span className="size-1.5 rounded-full 
              bg-[#B01817] animate-pulse" />
            Rabat · Maroc · Promo 2025
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-[clamp(4rem,10vw,7rem)] font-extrabold 
              tracking-tight leading-[0.92] max-w-3xl
              bg-clip-text text-transparent"
            style={{
              fontFamily: 'var(--font-display, Georgia, serif)',
              backgroundImage: 'linear-gradient(175deg, #FFFFFF 0%, rgba(255,255,255,0.72) 100%)',
              filter: 'drop-shadow(0 0 80px rgba(176,24,23,0.28))'
            }}>
            ENSIAS HUB
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-[17px] text-white/50 font-light 
              max-w-md leading-relaxed tracking-wide">
            Ensias un jour,{' '}
            <em className="text-white/70 italic font-light"
              style={{ fontStyle: 'italic' }}>
              Ensias pour toujours
            </em>
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex items-center gap-4">
            <button
              onClick={() => router.push('/login')}
              className="h-11 px-8 rounded-lg bg-[#B01817] 
                hover:bg-[#C41F1E] text-white font-semibold 
                text-[15px] transition-all duration-200
                shadow-[0_0_0_1px_rgba(176,24,23,0.7),_0_8px_32px_rgba(176,24,23,0.45)]
                hover:shadow-[0_0_0_1px_#C41F1E,_0_8px_48px_rgba(176,24,23,0.65)]">
              Login →
            </button>
            <button
              onClick={() => router.push('/login')}
              className="h-11 px-8 rounded-lg font-semibold 
                text-[15px] text-white/80 hover:text-white
                bg-white/10 hover:bg-white/16
                border border-white/20 hover:border-white/35
                backdrop-blur-sm transition-all duration-200">
              Explorer
            </button>
          </motion.div>
        </div>

        {/* ── BOTTOM FLOATING BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.8, ease: 'easeOut' }}
          className="absolute bottom-0 left-1/2 
            -translate-x-1/2 w-[88%] max-w-4xl z-20">
          <div className="bg-[#0d0f14]/90 backdrop-blur-xl
            border border-white/10 border-b-0 rounded-t-xl 
            px-6 py-4 flex items-center justify-between
            shadow-[0_-12px_48px_rgba(0,0,0,0.7)]">

            {/* Left */}
            <div className="flex items-center gap-3">
              <div className="flex size-6 items-center justify-center
                rounded-md bg-[#B01817] 
                shadow-[0_0_10px_rgba(176,24,23,0.6)]">
                <Zap className="size-3.5 text-white fill-white" />
              </div>
              <span className="text-white/25 text-sm">/</span>
              <span className="text-white/80 text-sm font-medium">
                ENSIAS Hub
              </span>
              <span className="text-white/15 text-sm">·</span>
              <span className="text-white/30 text-[11px] font-mono">
                dashboard
              </span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-400
                  shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                <span className="text-white/30 text-[11px] font-mono">
                  en ligne
                </span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div className="size-5 rounded-full bg-[#B01817]
                shadow-[0_0_10px_rgba(176,24,23,0.65)]" />
            </div>
          </div>
        </motion.div>

      </section>
    </div>
  );
}
