"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const features = [
  "Posts et actualites de ta promo",
  "Groupes par filiere et par module",
  "Evenements et annonces officielles",
  "Notifications en temps reel",
];

export default function FeedSection() {
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
      id="feed"
      ref={ref}
      className="relative min-h-screen flex items-center
                 px-6 py-32 overflow-hidden"
    >
      {/* Glow accent */}
      <div
        className="absolute top-1/2 right-1/4 -translate-y-1/2
                      w-96 h-96 bg-purple-500/5 blur-[100px]
                      pointer-events-none"
      />

      <div
        className="max-w-6xl mx-auto w-full grid
                      grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        {/* Screenshot — left on this section */}
        <motion.div
          style={{ y, opacity, scale }}
          className="relative order-2 lg:order-1"
        >
          <div className="absolute -inset-4 bg-purple-500/5 rounded-2xl blur-xl" />
          <div
            className="relative rounded-2xl overflow-hidden
                          border border-white/10 shadow-2xl"
          >
            <Image
              src="/images/capture-groups.png"
              alt="ENSIAS Hub Groupes"
              width={700}
              height={500}
              className="w-full"
            />
          </div>
        </motion.div>

        {/* Text — right on this section */}
        <motion.div
          style={{ opacity }}
          className="space-y-6 order-1 lg:order-2"
        >
          <span
            className="inline-block px-3 py-1 rounded-full text-xs
                           bg-purple-500/10 border border-purple-500/20
                           text-purple-400"
          >
            Feed et Groupes
          </span>

          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Reste connecte{" "}
            <span className="text-purple-400">avec ta promo</span>
          </h2>

          <p className="text-white/50 text-lg leading-relaxed">
            Un fil d&apos;actualite centralise pour ta promotion. Rejoins les
            groupes de ta filiere, suis les evenements et ne rate plus aucune
            annonce importante.
          </p>

          <ul className="space-y-3">
            {features.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                <span className="text-white/60 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
