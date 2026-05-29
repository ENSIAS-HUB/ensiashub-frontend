"use client";

import { motion, MotionValue, useTransform } from "framer-motion";
import Link from "next/link";

interface Props {
  scrollYProgress: MotionValue<number>;
}

export default function LandingNavbar({ scrollYProgress }: Props) {
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50
                       bg-[#080b14]/80 backdrop-blur-md
                       border-b border-white/5"
    >
      {/* Progress bar */}
      <motion.div
        style={{ scaleX, transformOrigin: "left" }}
        className="absolute bottom-0 left-0 right-0 h-px bg-red-500"
      />

      <div
        className="max-w-6xl mx-auto px-6 h-16
                      flex items-center justify-between"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/images/ensias-hub-only-logo.png"
            alt="ENSIAS Hub logo"
            className="w-7 h-7 object-contain"
          />
          <span className="font-bold text-white text-sm tracking-wide">
            ENSIAS Hub
          </span>
        </Link>

        <nav
          className="hidden md:flex items-center gap-8
                        text-sm text-white/50"
        >
          <a href="#features" className="hover:text-white transition-colors">
            Carte
          </a>
          <a href="#feed" className="hover:text-white transition-colors">
            Feed
          </a>
          <a href="#drive" className="hover:text-white transition-colors">
            Drive
          </a>
          <a href="#eats" className="hover:text-white transition-colors">
            Eats
          </a>
        </nav>

        <Link
          href="/login"
          className="px-4 py-2 bg-red-600 hover:bg-red-700
                     rounded-lg text-sm font-medium transition-colors text-white"
        >
          Se connecter
        </Link>
      </div>
    </header>
  );
}
