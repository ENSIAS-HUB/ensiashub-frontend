"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useMapStore } from "../../store/mapStore";
import { haversineDistance } from "../../utils/geo";

/**
 * Floating panel showing active route header and stop button.
 * Positioned at the bottom of the map.
 */
export function RouteInfoPanel() {
  const activeRoute = useMapStore((s) => s.activeRoute);
  const userLocation = useMapStore((s) => s.userLocation);
  const setActiveRoute = useMapStore((s) => s.setActiveRoute);

  // Detect arrival (< 10m from destination)
  useEffect(() => {
    if (!activeRoute || !userLocation) return;

    const remaining = haversineDistance(
      userLocation,
      activeRoute.destinationCoords,
    );

    if (remaining < 10) {
      toast.success("Vous etes arrive a destination");
      setActiveRoute(null);
    }
  }, [userLocation, activeRoute, setActiveRoute]);

  if (!activeRoute) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30
                 w-80 sm:w-96
                 bg-slate-800/95 backdrop-blur-sm
                 border-l-4 border-[#B01817]
                 rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-4">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-0.5">
            Itineraire vers
          </p>
          <p className="text-white font-semibold text-base">
            {activeRoute.destinationName}
          </p>
        </div>
        <button
          onClick={() => setActiveRoute(null)}
          aria-label="Fermer l'itineraire"
          className="text-slate-500 hover:text-white transition-colors
                     w-8 h-8 flex items-center justify-center
                     rounded-lg hover:bg-slate-700"
        >
          <X size={16} />
        </button>
      </div>

      {/* Stop button */}
      <div className="px-5 pb-4">
        <button
          onClick={() => setActiveRoute(null)}
          className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600
                     text-white text-sm font-medium transition-colors"
        >
          Arreter
        </button>
      </div>
    </motion.div>
  );
}
