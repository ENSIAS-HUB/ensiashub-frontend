"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <>
      {/* ── PARTIE 1 : Full-screen hero avec photo batiment ── */}
      <section
        className="relative h-screen w-full flex flex-col
                          items-center justify-center overflow-hidden"
      >
        {/* Photo batiment ENSIAS en fond */}
        <div className="absolute inset-0 z-0">
          {/* Overlay sombre global */}
          <div
            className="absolute inset-0 z-10"
            style={{ background: "rgba(0,0,0,0.65)" }}
          />

          {/* Fondu haut ET bas */}
          <div
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, #080b14 0%, transparent 15%, transparent 70%, #080b14 100%)",
            }}
          />

          <Image
            src="/images/ensias-building.jpg"
            alt="ENSIAS Campus"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Contenu hero */}
        <div
          className="relative z-30 flex flex-col
                        items-center text-center px-6
                        space-y-6 mt-8"
        >
          {/* Titre géant */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-7xl md:text-9xl font-black
                       tracking-tight leading-none
                       bg-gradient-to-b from-white to-white/75
                       bg-clip-text text-transparent"
            style={{ fontFamily: "serif" }}
          >
            ENSIAS HUB
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-white/80"
          >
            Ensiaste un jour,{" "}
            <em className="text-white font-medium">Ensiaste pour toujours</em>
          </motion.p>

          {/* Boutons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4 pt-2"
          >
            <Link
              href="/login"
              className="px-8 py-3 bg-[rgb(231,0,11)] hover:bg-[rgb(200,0,9)]
                         rounded-lg font-semibold text-white
                         transition-colors flex items-center gap-2"
            >
              Login →
            </Link>
            <a
              href="#features"
              className="px-8 py-3 border border-white/20
                         hover:border-white/50 rounded-lg
                         text-white/80 hover:text-white
                         transition-colors backdrop-blur-sm"
            >
              Explorer
            </a>
          </motion.div>
        </div>

        {/* Indicateur scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2
                     -translate-x-1/2 z-30
                     flex flex-col items-center gap-2"
        >
          <span
            className="text-white/50 text-xs
                           tracking-[0.3em] uppercase"
          >
            Defiler
          </span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="text-white/50"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── PARTIE 2 : Ancien contenu hero (badge + titre + CTA) ── */}
      <section
        id="features"
        className="relative min-h-screen flex flex-col
                   items-center justify-center px-6 overflow-hidden"
      >
        {/* Glow background */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2
                          w-[600px] h-[600px] rounded-full
                          bg-red-600/10 blur-[120px]"
          />
        </div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mb-6 px-4 py-1.5 rounded-full border
                     border-red-500/30 bg-red-500/10
                     text-red-400 text-xs font-medium"
        >
          Votre ecosysteme etudiant ENSIAS
        </motion.div>

        {/* Titre */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-center
                     leading-tight max-w-4xl"
        >
          Tout ce dont tu as besoin,{" "}
          <span className="text-red-500">en un seul endroit</span>
        </motion.h2>

        {/* Sous-titre */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-white/50 text-lg text-center max-w-xl"
        >
          Carte du campus, Feed etudiant, Drive partage, ENSIAS Eats — tout
          reunis en une seule plateforme.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex gap-4"
        >
          <Link
            href="/login"
            className="px-8 py-3 bg-red-600 hover:bg-red-700
                       rounded-lg font-semibold transition-colors text-white"
          >
            Commencer
          </Link>
          <a
            href="#features"
            className="px-8 py-3 border border-white/10
                       hover:border-white/30 rounded-lg
                       text-white/70 hover:text-white transition-colors"
          >
            Decouvrir
          </a>
        </motion.div>

        {/* Screenshot hero */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-20 relative w-full max-w-5xl mx-auto"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 60%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 60%, transparent 100%)",
          }}
        >
          <div
            className="absolute -inset-4 bg-red-500/5
                          rounded-2xl blur-xl"
          />
          <div
            className="relative rounded-2xl overflow-hidden
                          border border-white/10 shadow-2xl"
          >
            <Image
              src="/images/capture-feed.png"
              alt="ENSIAS Hub Feed"
              width={1200}
              height={700}
              className="w-full"
            />
          </div>
        </motion.div>
      </section>
    </>
  );
}
