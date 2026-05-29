"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const features = [
  "Partage de cours et TD par module",
  "Stockage cloud synchronise",
  "Acces hors ligne aux documents",
  "Organisation par module et filiere",
];

export default function DriveSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [80, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.95, 1]);

  return (
    <section
      id="drive"
      ref={ref}
      className="relative min-h-screen flex items-center
                 px-6 py-32 overflow-hidden"
    >
      {/* Glow accent */}
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2
                      w-96 h-96 bg-emerald-500/5 blur-[100px]
                      pointer-events-none"
      />

      <div
        className="max-w-6xl mx-auto w-full grid
                      grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        {/* Text */}
        <motion.div style={{ opacity }} className="space-y-6">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs
                           bg-emerald-500/10 border border-emerald-500/20
                           text-emerald-400"
          >
            The Drive
          </span>

          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Tes fichiers,{" "}
            <span className="text-emerald-400">toujours accessibles</span>
          </h2>

          <p className="text-white/50 text-lg leading-relaxed">
            Un drive collaboratif taille pour les etudiants ENSIAS. Partage tes
            cours, recupere les TD de tes camarades et garde tout organise par
            module.
          </p>

          <ul className="space-y-3">
            {features.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-white/60 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Screenshots — stacked */}
        <motion.div style={{ y, opacity, scale }} className="relative">
          {/* Secondary screenshot — offset behind */}
          <motion.div
            style={{ y: y2 }}
            className="absolute top-4 left-4 w-full rounded-2xl overflow-hidden
                       border border-white/10 shadow-xl opacity-60"
          >
            <Image
              src="/images/capture-drive2.png"
              alt="The Drive vue secondaire"
              width={700}
              height={500}
              className="w-full"
            />
          </motion.div>

          {/* Primary screenshot — on top */}
          <div
            className="relative rounded-2xl overflow-hidden
                          border border-white/10 shadow-2xl"
          >
            <div className="absolute -inset-4 bg-emerald-500/5 rounded-2xl blur-xl" />
            <Image
              src="/images/capture-drive.png"
              alt="The Drive vue principale"
              width={700}
              height={500}
              className="w-full relative"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
