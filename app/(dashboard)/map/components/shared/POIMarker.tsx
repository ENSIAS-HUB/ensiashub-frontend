"use client";

import { motion } from "framer-motion";

interface POIMarkerProps {
  /** Label displayed below the pin */
  label: string;
  /** Optional icon character or emoji */
  icon?: string;
  /** Whether this is a highlighted / active POI */
  active?: boolean;
  onClick?: () => void;
}

/**
 * Floating point-of-interest marker rendered as an absolute-positioned
 * element on the map overlay (not a Mapbox marker).
 */
export function POIMarker({
  label,
  icon = "📍",
  active = false,
  onClick,
}: POIMarkerProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.93 }}
      className="flex flex-col items-center gap-0.5 cursor-pointer focus:outline-none"
      aria-label={label}
    >
      <motion.div
        className={`flex size-8 items-center justify-center rounded-full shadow-lg border-2
          ${active ? "border-[#B01817] bg-[#B01817]/20" : "border-white/20 bg-[#111827]/80"}`}
        animate={
          active
            ? {
                boxShadow: [
                  "0 0 0 0 rgba(176,24,23,0.4)",
                  "0 0 0 8px rgba(176,24,23,0)",
                ],
              }
            : {}
        }
        transition={{ duration: 1.4, repeat: Infinity }}
      >
        <span className="text-sm leading-none">{icon}</span>
      </motion.div>
      <span
        className={`text-[10px] font-medium rounded px-1 py-0.5
          ${active ? "text-[#B01817] bg-[#B01817]/10" : "text-white/70 bg-black/50"}`}
      >
        {label}
      </span>
    </motion.button>
  );
}
