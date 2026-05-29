"use client";

import { Marker } from "react-map-gl/mapbox";
import { motion } from "framer-motion";
import { useMapStore } from "../../store/mapStore";

/**
 * Pulsing blue dot rendered at the user's GPS location on the outdoor map.
 * Matches the Google Maps "you are here" visual style.
 */
export function UserLocationMarker() {
  const userLocation = useMapStore((s) => s.userLocation);
  if (!userLocation) return null;

  return (
    <Marker longitude={userLocation[0]} latitude={userLocation[1]} anchor="center">
      <div className="relative flex items-center justify-center">
        {/* Outer precision ring */}
        <motion.div
          className="absolute rounded-full bg-blue-500/20 border border-blue-400/30"
          animate={{
            width: [40, 80, 40],
            height: [40, 80, 40],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Intermediate ring */}
        <motion.div
          className="absolute w-8 h-8 rounded-full bg-blue-500/10 border border-blue-400/40"
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
        />
        {/* Centre dot */}
        <div className="relative z-10 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg shadow-blue-500/50" />
      </div>
    </Marker>
  );
}
