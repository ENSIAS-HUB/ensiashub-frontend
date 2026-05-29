"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { MapRef } from "react-map-gl/mapbox";
import { useMapStore } from "../store/mapStore";
import { OutdoorMap } from "./outdoor/OutdoorMap";
import { IndoorMap } from "./indoor/IndoorMap";
import { TransitionOverlay } from "./shared/TransitionOverlay";
import { SearchBar } from "./shared/SearchBar";
import { MapControls } from "./shared/MapControls";
import type { SearchSuggestion } from "../types/map.types";
import { BUILDINGS, getBuildingById } from "../data/buildings";
import { useMapTransition } from "../hooks/useMapTransition";

/**
 * Top-level orchestrator for the Smart Campus Map.
 * Manages the outdoor ↔ transitioning ↔ indoor level switching
 * and renders the correct view layer.
 */
export function MapContainer() {
  const mapRef = useRef<MapRef>(null);
  const { level, activeFloor, setActiveFloor, destination } = useMapStore();
  const { enterBuilding, exitBuilding } = useMapTransition(mapRef);

  const handleSearchSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.kind === "building") {
      const building = getBuildingById(suggestion.buildingId);
      if (building?.hasIndoorMap) {
        enterBuilding(building);
      }
    } else if (suggestion.kind === "room") {
      // Destination was already set by SearchBar; also trigger building entry
      // if we are currently in the outdoor view
      const building = getBuildingById(suggestion.buildingId);
      if (building && useMapStore.getState().level === "outdoor") {
        enterBuilding(building);
      }
    }
  };

  const building = useMapStore((s) =>
    s.activeBuilding ? getBuildingById(s.activeBuilding) : null,
  );

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl bg-[#0b0d0f]">
      {/* -- Top toolbar --------------------------------------------- */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <SearchBar mapRef={mapRef} onSuggestionSelect={handleSearchSelect} />

        {/* Floor switcher (indoor only) */}
        <AnimatePresence>
          {level === "indoor" && building && building.floors.length > 1 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex gap-1"
            >
              {building.floors.map((floor, idx) => (
                <button
                  key={floor}
                  onClick={() => setActiveFloor(idx)}
                  className={`h-8 px-3 rounded-lg text-[11px] font-semibold border transition-colors
                    ${
                      activeFloor === idx
                        ? "bg-[#B01817] border-[#B01817] text-white"
                        : "bg-[#111827]/90 border-white/10 text-white/50 hover:text-white"
                    }`}
                >
                  {floor}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* -- Custom zoom / reset controls ---------------------------- */}
      <MapControls mapRef={mapRef} onIndoorExit={exitBuilding} />

      {/* -- Map layers ---------------------------------------------- */}
      <AnimatePresence mode="sync">
        {/* Outdoor Mapbox map */}
        {(level === "outdoor" || level === "transitioning") && (
          <motion.div
            key="outdoor"
            className="absolute inset-0"
            animate={{ opacity: level === "transitioning" ? 0 : 1 }}
            transition={{ duration: 0.4 }}
          >
            <OutdoorMap mapRef={mapRef} />
          </motion.div>
        )}

        {/* Indoor SVG floor plan */}
        {(level === "indoor" || level === "transitioning") && (
          <motion.div
            key="indoor"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: level === "indoor" ? 1 : 0 }}
            transition={{ duration: 0.6, delay: level === "indoor" ? 0.3 : 0 }}
          >
            <IndoorMap />
          </motion.div>
        )}
      </AnimatePresence>

      {/* -- Black transition overlay (always on top) ---------------- */}
      <TransitionOverlay />

      {/* -- Level indicator badge ----------------------------------- */}
      <AnimatePresence>
        {level === "indoor" && destination && (
          <motion.div
            key="dest-badge"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-14 left-3 z-20 flex items-center gap-1.5 rounded-lg
                       border border-[#B01817]/30 bg-[#111827]/90 backdrop-blur-sm px-2.5 py-1.5"
          >
            <span className="size-1.5 rounded-full bg-[#B01817] animate-pulse" />
            <span className="text-[11px] text-white/80 font-medium truncate max-w-[180px]">
              {destination.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
