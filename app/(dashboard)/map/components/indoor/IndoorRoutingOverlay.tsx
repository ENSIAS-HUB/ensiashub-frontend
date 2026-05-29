"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { RoomNode } from "../../types/map.types";

interface IndoorRoutingOverlayProps {
  route: RoomNode[];
}

/**
 * Renders an animated path between route nodes inside the SVG floor plan.
 * Uses a dash-offset animation for the "flowing" effect.
 */
export function IndoorRoutingOverlay({ route }: IndoorRoutingOverlayProps) {
  if (route.length < 2) return null;

  // Build polyline points from route nodes
  const points = route.map((node) => `${node.svgX},${node.svgY}`).join(" ");

  // Rough total path length for dasharray
  let pathLength = 0;
  for (let i = 1; i < route.length; i++) {
    const prev = route[i - 1];
    const curr = route[i];
    pathLength += Math.sqrt(
      (curr.svgX - prev.svgX) ** 2 + (curr.svgY - prev.svgY) ** 2,
    );
  }

  return (
    <g style={{ filter: "drop-shadow(0 0 3px #B01817)" }}>
      {/* Glow base */}
      <polyline
        points={points}
        fill="none"
        stroke="#B01817"
        strokeWidth={1.2}
        strokeOpacity={0.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Animated dash line */}
      <motion.polyline
        points={points}
        fill="none"
        stroke="#B01817"
        strokeWidth={0.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`3 4`}
        animate={{ strokeDashoffset: [0, -28] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      />

      {/* Direction arrows at each intermediate node */}
      {route.slice(1, -1).map((node, i) => {
        const prev = route[i];
        const angle =
          (Math.atan2(node.svgY - prev.svgY, node.svgX - prev.svgX) * 180) /
          Math.PI;
        return (
          <motion.polygon
            key={node.id}
            points="0,-1.5 2.5,0 0,1.5"
            transform={`translate(${node.svgX},${node.svgY}) rotate(${angle})`}
            fill="#B01817"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </g>
  );
}
