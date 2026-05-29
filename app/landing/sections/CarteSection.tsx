"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const features = [
  "Itineraire pas a pas sur les allees du campus",
  "Marqueur GPS en temps reel",
  "Plan interieur des batiments",
  "Recherche instantanee de salles",
];

export default function CarteSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.95, 1]);

  return (
    <section
      id="features"
      ref={ref}
      className="relative min-h-screen flex items-center
                 px-6 py-32 overflow-hidden"
    >
      {/* Glow accent */}
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2
                      w-96 h-96 bg-blue-500/5 blur-[100px]
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
                           bg-blue-500/10 border border-blue-500/20
                           text-blue-400"
          >
            Carte du Campus
          </span>

          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Trouve ton chemin{" "}
            <span className="text-blue-400">en temps reel</span>
          </h2>

          <p className="text-white/50 text-lg leading-relaxed">
            Navigation GPS sur le campus ENSIAS. Routing intelligent via
            Dijkstra sur les allees reelles. Batiments, salles, terrains — tout
            est cartographie.
          </p>

          <ul className="space-y-3">
            {features.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <span className="text-white/60 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Screenshot */}
        <motion.div style={{ y, opacity, scale }} className="relative">
          <div className="absolute -inset-4 bg-blue-500/5 rounded-2xl blur-xl" />
          <div
            className="relative rounded-2xl overflow-hidden
                          border border-white/10 shadow-2xl"
          >
            <Image
              src="/images/capture-carte.png"
              alt="Carte Campus ENSIAS"
              width={700}
              height={500}
              className="w-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
