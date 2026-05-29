"use client";

import Image from "next/image";

export default function AuthLeftPanel() {
  return (
    <div
      className="relative hidden lg:flex flex-col justify-end
                    w-1/2 min-h-screen bg-[#0a0a0a] overflow-hidden p-12"
    >
      {/* ── Photo fondue ─────────────────────────────────── */}
      <div
        className="absolute inset-0 top-0 left-0
                   w-full h-[75%]"
        style={{
          maskImage: `linear-gradient(
            to bottom,
            black 0%,
            black 40%,
            transparent 100%
          ),
          linear-gradient(
            to right,
            black 0%,
            black 60%,
            transparent 100%
          )`,
          maskComposite: "intersect",
          WebkitMaskImage: `linear-gradient(
            to bottom,
            black 0%,
            black 40%,
            transparent 100%
          ),
          linear-gradient(
            to right,
            black 0%,
            black 60%,
            transparent 100%
          )`,
          WebkitMaskComposite: "source-in",
        }}
      >
        {/* Overlay sombre sur la photo */}
        <div className="absolute inset-0 bg-black/25 z-10" />

        <Image
          src="/images/ensias-sunset.jpg"
          alt="ENSIAS Campus"
          fill
          className="object-cover object-top opacity-90"
          priority
        />
      </div>

      {/* Dégradé noir absolu en bas */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 z-20
                   pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, #000000 100%)",
        }}
      />

      {/* ── Texte en bas (toujours lisible) ──────────────── */}
      <div
        className="fixed bottom-8 left-8 z-50 space-y-2
                   hidden lg:block"
      >
        {/* Barre rouge decorative */}
        <div className="w-8 h-0.5 bg-red-500" />

        <h1 className="text-2xl font-bold text-white tracking-tight">
          ENSIAS Hub
        </h1>

        <p className="text-xs text-white/40 italic max-w-xs leading-relaxed">
          &ldquo;L&apos;excellence n&apos;est pas une destination, c&apos;est un
          voyage permanent.&rdquo;
        </p>
      </div>
    </div>
  );
}
