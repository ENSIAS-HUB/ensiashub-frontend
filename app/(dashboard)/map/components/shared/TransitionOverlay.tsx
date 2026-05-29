"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMapStore } from "../../store/mapStore";

/**
 * Cinematic full-screen overlay that plays during outdoor → indoor transitions.
 * Displays a dark slate backdrop with animated spinner and progress bar.
 * Never shows white — background is always bg-slate-950.
 */
export function TransitionOverlay() {
  const level = useMapStore((s) => s.level);
  const activeBuilding = useMapStore((s) => s.activeBuilding);

  const isActive = level === "transitioning";

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="transition-overlay"
          className="fixed inset-0 z-50 bg-slate-950 pointer-events-none
                     flex flex-col items-center justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* Animated ring + spinner */}
          <div className="relative w-16 h-16">
            {/* Pulsing outer ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-600/30"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Spinning arc */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-red-600"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
            {/* Centre icon */}
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
              🏛️
            </div>
          </div>

          {/* Label */}
          <motion.div
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-white font-medium text-sm">
              Chargement du plan intérieur
            </p>
            <p className="text-slate-500 text-xs">
              {activeBuilding === "administration"
                ? "Administration — ENSIAS"
                : "ENSIAS Hub"}
            </p>
          </motion.div>

          {/* Simulated progress bar */}
          <div className="w-48 h-0.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-red-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

