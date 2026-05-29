"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useQRCodeEntry } from "../hooks/useQRCodeEntry";

// Mapbox must be loaded client-side only (uses browser APIs)
const MapContainer = dynamic(
  () =>
    import("./MapContainer").then((m) => ({
      default: m.MapContainer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#0b0d0f] rounded-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="size-9 rounded-full border-2 border-[#B01817] border-t-transparent animate-spin" />
          <p className="text-xs text-white/40 font-mono">
            Chargement de la carte…
          </p>
        </div>
      </div>
    ),
  },
);

/**
 * Client wrapper rendered inside the Suspense boundary defined in page.tsx.
 * Using `useSearchParams()` here is safe because this component is always
 * inside a <Suspense> from the parent server component.
 */
export default function MapPageClient() {
  // Reads ?entry= and ?room= from the URL for QR code deep-links
  useQRCodeEntry();

  return (
    <motion.div
      className="flex flex-col h-[calc(100vh-3rem)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <MapContainer />
    </motion.div>
  );
}
