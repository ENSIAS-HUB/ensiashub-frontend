"use client";

import { motion } from "framer-motion";
import { X, Navigation, Map } from "lucide-react";
import { useMapStore } from "../../store/mapStore";
import { useCampusRouting } from "../../hooks/useCampusRouting";
import type { SelectedBuilding } from "../../types/map.types";

interface BuildingPopupProps {
  building: SelectedBuilding;
  onClose: () => void;
  onExplore: () => void;
}

/**
 * Slide-up panel shown when the user taps a campus building.
 * Offers "M'y conduire" (GPS route) and "Explorer le plan" (indoor map).
 */
export function BuildingPopup({
  building,
  onClose,
  onExplore,
}: BuildingPopupProps) {
  const userLocation = useMapStore((s) => s.userLocation);
  const { fetchRoute } = useCampusRouting();

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]
                 w-80 sm:w-96 max-h-[40vh]
                 bg-slate-800/95 backdrop-blur-sm
                 border border-slate-700/50
                 rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-4 pb-3">
        <div>
          <p className="text-white font-semibold text-base leading-tight">
            {building.name}
          </p>
          <p className="text-slate-400 text-xs mt-0.5">Campus ENSIAS</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="shrink-0 w-8 h-8 flex items-center justify-center
                     rounded-lg text-slate-500 hover:text-white
                     hover:bg-slate-700 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2 px-5 pb-5">
        {!building.noRouting && (
          <button
            onClick={() => {
              fetchRoute(building.coordinates, building.name);
              onClose();
            }}
            disabled={!userLocation}
            title={!userLocation ? "Activez la geolocalisation" : undefined}
            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                        text-sm font-medium transition-colors
                        ${
                          userLocation
                            ? "bg-[#B01817] text-white hover:bg-[#9a1414]"
                            : "bg-slate-700 text-slate-400 cursor-not-allowed"
                        }`}
          >
            <Navigation size={15} />
            {userLocation ? "Direction" : "Geolocalisation requise"}
          </button>
        )}

        {building.hasIndoorMap && (
          <button
            onClick={onExplore}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                       text-sm font-medium border border-[#B01817]/60
                       text-[#B01817] hover:bg-[#B01817]/10 transition-colors"
          >
            <Map size={15} />
            Explorer le plan
          </button>
        )}
      </div>
    </motion.div>
  );
}
