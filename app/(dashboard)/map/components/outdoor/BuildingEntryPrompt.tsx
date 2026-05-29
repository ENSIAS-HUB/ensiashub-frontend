"use client";

import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import type { Building } from "../../types/map.types";

interface BuildingEntryPromptProps {
  building: Building;
  destination: string | null;
  onEnter: () => void;
  onDismiss: () => void;
}

/**
 * Floating card that appears at the bottom of the screen when the user
 * selects a building. Prompts them to enter the indoor view.
 */
export function BuildingEntryPrompt({
  building,
  destination,
  onEnter,
  onDismiss,
}: BuildingEntryPromptProps) {
  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 120, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[min(92vw,400px)]"
    >
      <div className="relative rounded-2xl border border-white/10 bg-[#111827]/95 backdrop-blur-md p-4 shadow-2xl">
        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-white/30 hover:text-white/70 transition-colors"
          aria-label="Fermer"
        >
          <X size={14} />
        </button>

        {/* Building info */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#B01817]/15 text-[#B01817]">
            🏛️
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">
              {building.name}
            </p>
            {destination && (
              <p className="text-xs text-white/50 mt-0.5">
                Destination :{" "}
                <span className="text-white/80">{destination}</span>
              </p>
            )}
            {building.hasIndoorMap ? (
              <p className="text-[10px] text-[#B01817]/70 mt-1 font-mono uppercase tracking-wide">
                Plan intérieur disponible
              </p>
            ) : (
              <p className="text-[10px] text-white/30 mt-1 font-mono uppercase tracking-wide">
                Plan intérieur non disponible
              </p>
            )}
          </div>
        </div>

        {/* Enter button */}
        <motion.button
          onClick={onEnter}
          disabled={!building.hasIndoorMap}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#B01817] text-white text-sm font-semibold py-2.5 px-4
                     disabled:opacity-30 disabled:cursor-not-allowed
                     hover:bg-[#8f1211] transition-colors"
          whileTap={{ scale: 0.97 }}
        >
          Entrer dans le bâtiment
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight size={15} />
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
}
