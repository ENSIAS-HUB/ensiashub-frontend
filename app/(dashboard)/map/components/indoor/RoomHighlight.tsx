"use client";

import { motion } from "framer-motion";
import type { RoomNode } from "../../types/map.types";

interface RoomHighlightProps {
  room: RoomNode;
  isDestination: boolean;
}

/**
 * Animated highlight overlay for a room in the indoor SVG plan.
 * Destination rooms pulse with a red glow.
 */
export function RoomHighlight({ room, isDestination }: RoomHighlightProps) {
  if (!isDestination) return null;

  const x = room.svgX - room.width / 2;
  const y = room.svgY - room.height / 2;

  return (
    <g>
      {/* Pulsing outer glow */}
      <motion.rect
        x={x - 1}
        y={y - 1}
        width={room.width + 2}
        height={room.height + 2}
        rx={1.5}
        fill="#B01817"
        stroke="none"
        animate={{ opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Solid destination fill */}
      <rect
        x={x}
        y={y}
        width={room.width}
        height={room.height}
        rx={1}
        fill="#B01817"
        fillOpacity={0.25}
        stroke="#B01817"
        strokeWidth={0.6}
      />
    </g>
  );
}
