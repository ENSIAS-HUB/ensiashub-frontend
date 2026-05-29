"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const features = [
  "Menu du jour mis a jour en temps reel",
  "Commande en avance pour eviter la queue",
  "Notifications de disponibilite des plats",
  "Historique de tes commandes",
];

export default function EatsSection() {
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
      id="eats"
      ref={ref}
      className="relative min-h-screen flex items-center
                 px-6 py-32 overflow-hidden"
    >
      {/* Background building photo */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          maskImage: "linear-gradient(to bottom, black 0%, transparent 60%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, transparent 60%)",
        }}
      >
        <div className="absolute inset-0 bg-black/70 z-10" />
        <Image
          src="/images/ensias-building.jpg"
          alt="ENSIAS Building"
          fill
          className="object-cover object-top opacity-50"
        />
      </div>

      {/* Glow accent */}
      <div
        className="absolute top-1/2 right-1/4 -translate-y-1/2
                      w-96 h-96 bg-orange-500/5 blur-[100px]
                      pointer-events-none"
      />

      <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col">
        {/* Quote banner */}
        <motion.div
          style={{ opacity }}
          className="relative z-10 text-center mb-16 space-y-2"
        >
          <p
            className="text-xs font-medium tracking-[0.3em] uppercase
                        text-orange-400/70"
          >
            ENSIAS Eats
          </p>
          <p className="text-2xl md:text-3xl font-light text-white/60 italic">
            &ldquo;Ensiaste un jour, Ensiaste pour toujours&rdquo;
          </p>
          <div className="w-12 h-px bg-orange-500/50 mx-auto mt-4" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Screenshot — left */}
          <motion.div
            style={{ y, opacity, scale }}
            className="relative z-10 order-2 lg:order-1"
          >
            <div className="absolute -inset-4 bg-orange-500/5 rounded-2xl blur-xl" />
            <div
              className="relative rounded-2xl overflow-hidden
                          border border-white/10 shadow-2xl"
            >
              <Image
                src="/images/capture-ensias-eats.png"
                alt="ENSIAS Eats"
                width={700}
                height={500}
                className="w-full"
              />
            </div>
          </motion.div>

          {/* Text — right */}
          <motion.div
            style={{ opacity }}
            className="relative z-10 space-y-6 order-1 lg:order-2"
          >
            <span
              className="inline-block px-3 py-1 rounded-full text-xs
                           bg-orange-500/10 border border-orange-500/20
                           text-orange-400"
            >
              ENSIAS Eats
            </span>

            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              La cafeteria{" "}
              <span className="text-orange-400">dans ta poche</span>
            </h2>

            <p className="text-white/50 text-lg leading-relaxed">
              Consulte le menu de la cafeteria, commande en avance et recois une
              notification quand ton plat est pret. Fini les longues attentes a
              la cafet.
            </p>

            <ul className="space-y-3">
              {features.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                  <span className="text-white/60 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
