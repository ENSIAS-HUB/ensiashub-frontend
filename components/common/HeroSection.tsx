/**
 * HeroSection — Dual-Font System Demo
 *
 * ┌─ FONT RULES ────────────────────────────────────────────────────────────┐
 * │  font-serif   → Newsreader  : h1, h2, hero titles, big stat numbers     │
 * │  font-sans    → Inter       : subtitles, body copy, buttons, labels      │
 * │  font-mono    → GeistMono   : badges, metadata, version strings          │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
'use client';

import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

interface HeroSectionProps {
  /** Overline badge text above the title */
  badge?: string;
  /** Main headline — rendered in Newsreader (serif) */
  title?: string;
  /** Italic serif accent inside the title */
  titleAccent?: string;
  /** Subtitle — rendered in Inter (sans) */
  subtitle?: string;
  /** Primary CTA */
  cta?: { label: string; href: string };
  /** Secondary CTA */
  ctaSecondary?: { label: string; href: string };
  /** Stats row */
  stats?: { value: string; label: string }[];
}

export function HeroSection({
  badge = 'ENSIAS Hub — v2.0',
  title = 'La plateforme étudiante',
  titleAccent = 'pensée pour vous.',
  subtitle =
    'Accédez au feed, au Drive collaboratif, aux groupes et aux données du campus intelligent — tout en un seul endroit.',
  cta = { label: 'Commencer', href: '/feed' },
  ctaSecondary = { label: 'En savoir plus', href: '#features' },
  stats = [
    { value: '2 400+', label: 'Étudiants' },
    { value: '180+',   label: 'Ressources' },
    { value: '40+',    label: 'Groupes actifs' },
  ],
}: HeroSectionProps) {
  return (
    <section className="relative flex flex-col items-center justify-center px-6 py-24 text-center overflow-hidden">
      {/*
       * Subtle background glow — purely decorative, stays below content
       * Uses the ENSIAS red as the single accent in the environment
       */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div
          className="size-[600px] rounded-full opacity-[0.04]"
          style={{
            background:
              'radial-gradient(circle, #B01817 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Badge ── font-mono: version/metadata strings live here */}
      <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
        style={{ borderColor: 'var(--border)' }}
      >
        <Zap className="size-3 text-[#B01817]" />
        {badge}
      </span>

      {/*
       * ── Hero Title ── font-serif (Newsreader)
       * The ONLY place in the dashboard where serif is used.
       * tracking-tight + large size = Railway "Signifier" feel.
       */}
      <h1 className="font-serif text-5xl font-light tracking-tight text-foreground sm:text-6xl lg:text-7xl">
        {title}{' '}
        {/* Italic serif accent — the "premium" touch */}
        <em className="font-serif font-normal not-italic italic text-[#B01817]">
          {titleAccent}
        </em>
      </h1>

      {/*
       * ── Subtitle ── font-sans (Inter)
       * Body copy is always Inter — no exceptions.
       */}
      <p className="mt-6 max-w-[520px] font-sans text-[15px] font-normal leading-relaxed text-muted-foreground">
        {subtitle}
      </p>

      {/*
       * ── CTAs ── font-sans (Inter), font-medium, 13px
       * Buttons are always sans-serif, compact Railway style.
       */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={cta.href}
          className="inline-flex items-center gap-2 h-9 rounded-md bg-[#B01817] px-4 font-sans text-[13px] font-medium text-white transition-all duration-150 hover:bg-[#D42B2A] shadow-[0_0_0_1px_#B01817] hover:shadow-[0_0_14px_rgba(176,24,23,0.4)]"
        >
          {cta.label}
          <ArrowRight className="size-3.5" />
        </Link>

        <Link
          href={ctaSecondary.href}
          className="inline-flex items-center gap-2 h-9 rounded-md border px-4 font-sans text-[13px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-white/5 hover:text-foreground"
          style={{ borderColor: 'var(--border)' }}
        >
          {ctaSecondary.label}
        </Link>
      </div>

      {/*
       * ── Stats row ──
       * Big numbers: font-serif (Newsreader) — impact figures
       * Labels below: font-sans (Inter) — descriptive text
       */}
      {stats && stats.length > 0 && (
        <div
          className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 border-t pt-10"
          style={{ borderColor: 'var(--border)' }}
        >
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              {/* serif for the number — same rule as h1/h2 */}
              <span className="font-serif text-3xl font-light tracking-tight text-foreground">
                {value}
              </span>
              {/* sans for the descriptor */}
              <span className="font-sans text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
