"use client";

import { motion } from "framer-motion";
import { useMapStore } from "../../store/mapStore";
import { ADMIN_BUILDING_ROOMS } from "../../data/indoor/admin-building";
import type { RoomNode } from "../../types/map.types";

interface MiniMapProps {
  currentFloor: number;
  route: RoomNode[];
}

/**
 * A compact 80×80px overview of the current floor in the bottom-right corner.
 * Tapping it returns to the outdoor view.
 */
export function MiniMap({ currentFloor, route }: MiniMapProps) {
  const { triggerTransition, resetMap } = useMapStore();

  const handleExit = () => {
    triggerTransition("exiting");
    setTimeout(() => {
      resetMap();
    }, 1000);
  };

  const rooms = ADMIN_BUILDING_ROOMS.filter((r) => r.floor === currentFloor);

  // Scale the 0-100 SVG space into the minimap viewport
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.3 }}
      onClick={handleExit}
      aria-label="Retour à la vue extérieure"
      className="absolute bottom-4 right-4 z-20 rounded-xl border border-white/15
                 bg-[#111827]/90 backdrop-blur-sm overflow-hidden shadow-xl
                 hover:border-[#B01817]/50 transition-colors group"
      style={{ width: 80, height: 80 }}
    >
      {/* Miniature SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ background: "#0b0d14" }}
      >
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          fill="none"
          stroke="#1e293b"
          strokeWidth={1}
        />

        {rooms
          .filter((r) => r.type === "corridor")
          .map((r) => (
            <rect
              key={r.id}
              x={r.svgX - r.width / 2}
              y={r.svgY - r.height / 2}
              width={r.width}
              height={r.height}
              fill="#1e293b"
            />
          ))}

        {rooms
          .filter(
            (r) =>
              r.type === "room" ||
              r.type === "entrance" ||
              r.type === "office" ||
              r.type === "toilet",
          )
          .map((r) => (
            <rect
              key={r.id}
              x={r.svgX - r.width / 2}
              y={r.svgY - r.height / 2}
              width={r.width}
              height={r.height}
              rx={0.5}
              fill={
                r.type === "office"
                  ? "#1a2535"
                  : r.type === "toilet"
                    ? "#1c1917"
                    : r.type === "entrance"
                      ? "#0b2012"
                      : "#1e2433"
              }
              stroke={
                r.type === "office"
                  ? "#2d4a7a"
                  : r.type === "toilet"
                    ? "#44403c"
                    : r.type === "entrance"
                      ? "#22c55e"
                      : "#334155"
              }
              strokeWidth={0.4}
            />
          ))}

        {/* Route highlight */}
        {route.length >= 2 && (
          <polyline
            points={route.map((n) => `${n.svgX},${n.svgY}`).join(" ")}
            fill="none"
            stroke="#B01817"
            strokeWidth={1.5}
            strokeOpacity={0.8}
            strokeLinecap="round"
          />
        )}

        {/* Current position pulse */}
        <motion.circle
          cx={50}
          cy={92}
          r={2.5}
          fill="#B01817"
          animate={{ r: [2, 3.5, 2], opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </svg>

      {/* Tooltip hint */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-xl">
        <span className="text-[9px] text-white font-semibold text-center leading-tight px-1">
          ← Sortir
        </span>
      </div>
    </motion.button>
  );
}
