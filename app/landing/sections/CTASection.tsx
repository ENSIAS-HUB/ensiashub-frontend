"use client";

import Link from "next/link";

export default function CTASection() {
  return (
    <section
      className="relative min-h-[60vh] flex flex-col
                        items-center justify-center px-6 text-center"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2
                        -translate-y-1/2 w-[500px] h-[300px]
                        bg-red-600/15 blur-[100px]"
        />
      </div>

      <h2
        className="text-4xl md:text-6xl font-bold max-w-3xl
                     leading-tight relative z-10"
      >
        Pret a rejoindre <span className="text-red-500">ENSIAS Hub ?</span>
      </h2>

      <p className="mt-6 text-white/40 max-w-md relative z-10">
        Acces reserve aux etudiants et professeurs de l&apos;ENSIAS (@um5.ac.ma)
      </p>

      <Link
        href="/login"
        className="mt-10 px-10 py-4 bg-red-600 hover:bg-red-700
                   rounded-xl font-semibold text-lg transition-colors
                   relative z-10 shadow-lg shadow-red-500/20 text-white"
      >
        Commencer maintenant
      </Link>

      <footer className="mt-20 pb-8 text-white/20 text-xs font-mono relative z-10">
        © {new Date().getFullYear()} ENSIAS Hub — Tous droits reserves
      </footer>
    </section>
  );
}
