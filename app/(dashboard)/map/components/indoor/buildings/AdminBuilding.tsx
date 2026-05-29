"use client";

import { motion } from "framer-motion";
import { useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw, ArrowLeft } from "lucide-react";
import { ADMIN_BUILDING_ROOMS } from "../../../data/indoor/admin-building";
import { IndoorRoutingOverlay } from "../IndoorRoutingOverlay";
import { RoomHighlight } from "../RoomHighlight";
import { useMapStore } from "../../../store/mapStore";
import { useSVGGestures } from "../../../hooks/useSVGGestures";
import type { RoomNode } from "../../../types/map.types";

interface AdminBuildingProps {
  /** Which floor to display (0 = RDC, 1 = 1er étage) */
  activeFloor: number;
  /** A* computed route */
  route: RoomNode[];
  /** ID of the destination room */
  destinationId: string | null;
}

function CorridorShape({ room }: { room: RoomNode }) {
  const x = room.svgX - room.width / 2;
  const y = room.svgY - room.height / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={room.width}
        height={room.height}
        rx={0.5}
        fill="#1e293b"
        stroke="#334155"
        strokeWidth={0.4}
      />
    </g>
  );
}

function RoomShape({
  room,
  isDestination,
}: {
  room: RoomNode;
  isDestination: boolean;
}) {
  const x = room.svgX - room.width / 2;
  const y = room.svgY - room.height / 2;
  const cx = room.svgX;
  const cy = room.svgY;

  // Type-based fill/stroke colours
  const typeStyle: Record<
    string,
    { fill: string; stroke: string; text: string }
  > = {
    room: {
      fill: "#1e2433",
      stroke: "#475569",
      text: "rgba(255,255,255,0.65)",
    },
    office: { fill: "#1a2535", stroke: "#2d4a7a", text: "#93c5fd" },
    toilet: { fill: "#1c1917", stroke: "#44403c", text: "#78716c" },
    entrance: { fill: "#0b2012", stroke: "#22c55e", text: "#4ade80" },
    stairs: {
      fill: "#111827",
      stroke: "#475569",
      text: "rgba(255,255,255,0.5)",
    },
    corridor: { fill: "#1e293b", stroke: "#334155", text: "#64748b" },
    elevator: { fill: "#1c1917", stroke: "#44403c", text: "#78716c" },
  };
  const style = typeStyle[room.type] ?? typeStyle.room;

  return (
    <g>
      {/* Animated halo on the destination room */}
      {isDestination && (
        <motion.rect
          x={x - 2}
          y={y - 2}
          width={room.width + 4}
          height={room.height + 4}
          rx={1.5}
          fill="#B01817"
          stroke="none"
          style={{ filter: "blur(4px)" }}
          animate={{ opacity: [0.35, 0, 0.35] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <RoomHighlight room={room} isDestination={isDestination} />
      <rect
        x={x}
        y={y}
        width={room.width}
        height={room.height}
        rx={0.8}
        fill={isDestination ? "#1a0808" : style.fill}
        stroke={isDestination ? "#B01817" : style.stroke}
        strokeWidth={isDestination ? 0.6 : 0.35}
      />
      {/* Icon (emoji) centred top half */}
      {room.icon && room.width > 12 && (
        <text
          x={cx}
          y={cy - (room.height > 10 ? 2 : 0.5)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={Math.min(room.width, room.height) * 0.22}
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          {room.icon}
        </text>
      )}
      <text
        x={cx}
        y={cy + (room.icon && room.width > 12 && room.height > 10 ? 2.5 : 0)}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={Math.min(room.width, room.height) * 0.22}
        fill={isDestination ? "#fff" : style.text}
        fontWeight={isDestination ? "600" : "400"}
        style={
          isDestination ? { filter: "drop-shadow(0 0 3px #B01817)" } : undefined
        }
      >
        {room.name.length > 18 ? room.name.slice(0, 17) + "…" : room.name}
      </text>
    </g>
  );
}

function StairsShape({ room }: { room: RoomNode }) {
  const x = room.svgX - room.width / 2;
  const y = room.svgY - room.height / 2;
  const cx = room.svgX;
  const cy = room.svgY;
  const steps = 4;
  const stepH = room.height / steps;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={room.width}
        height={room.height}
        rx={0.5}
        fill="#111827"
        stroke="#475569"
        strokeWidth={0.4}
      />
      {Array.from({ length: steps }).map((_, i) => (
        <line
          key={i}
          x1={x}
          y1={y + i * stepH}
          x2={x + room.width}
          y2={y + i * stepH}
          stroke="#334155"
          strokeWidth={0.3}
        />
      ))}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={2.5}
        fill="rgba(255,255,255,0.5)"
      >
        ⬆
      </text>
    </g>
  );
}

function EntranceShape({ room }: { room: RoomNode }) {
  const x = room.svgX - room.width / 2;
  const y = room.svgY - room.height / 2;
  const cx = room.svgX;
  const cy = room.svgY;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={room.width}
        height={room.height}
        rx={0.5}
        fill="#0b2012"
        stroke="#22c55e"
        strokeWidth={0.5}
      />
      <text
        x={cx}
        y={cy - 0.5}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={2.2}
        fill="#4ade80"
      >
        ↑ Entrée
      </text>
    </g>
  );
}

/**
 * SVG floor plan of the Administration building.
 * Supports mouse/touch pan and wheel/pinch zoom.
 * Renders all rooms, corridors, stairs and the routing overlay.
 */
export function AdminBuilding({
  activeFloor,
  route,
  destinationId,
}: AdminBuildingProps) {
  const { triggerTransition, resetMap } = useMapStore();
  const rooms = ADMIN_BUILDING_ROOMS.filter((r) => r.floor === activeFloor);
  const floorRoute = route.filter((r) => r.floor === activeFloor);

  // -- Gesture-based pan/zoom -----------------------------------------------
  const { bind, containerRef, transform, reset, zoomIn, zoomOut } =
    useSVGGestures();

  // -- Exit handler ----------------------------------------------------------
  const handleExit = useCallback(() => {
    triggerTransition("exiting");
    setTimeout(() => resetMap(), 1000);
  }, [triggerTransition, resetMap]);

  const floorLabel = activeFloor === 0 ? "RDC" : "1ER";

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        onClick={handleExit}
        className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-3 py-1.5
                   rounded-lg bg-[#111827]/90 border border-white/10 text-white/70
                   hover:text-white hover:border-[#B01817]/50 transition-colors
                   backdrop-blur-sm shadow text-[12px] font-medium"
      >
        <ArrowLeft size={13} />
        Retour
      </motion.button>

      {/* Zoom control buttons */}
      <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-1">
        <button
          aria-label="Zoom avant"
          onClick={zoomIn}
          className="flex size-7 items-center justify-center rounded-lg
                     bg-[#111827]/90 border border-white/10 text-white/60
                     hover:text-white hover:bg-white/10 backdrop-blur-sm
                     transition-colors shadow text-sm"
        >
          <ZoomIn size={13} />
        </button>
        <button
          aria-label="Zoom arrière"
          onClick={zoomOut}
          className="flex size-7 items-center justify-center rounded-lg
                     bg-[#111827]/90 border border-white/10 text-white/60
                     hover:text-white hover:bg-white/10 backdrop-blur-sm
                     transition-colors shadow text-sm"
        >
          <ZoomOut size={13} />
        </button>
        <button
          aria-label="Réinitialiser la vue"
          onClick={reset}
          className="flex size-7 items-center justify-center rounded-lg
                     bg-[#111827]/90 border border-white/10 text-white/60
                     hover:text-white hover:bg-white/10 backdrop-blur-sm
                     transition-colors shadow text-sm"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Gesture-controlled SVG container */}
      {/* @ts-expect-error framer-motion onDrag type conflicts with @use-gesture bind() */}
      <motion.div
        ref={containerRef}
        className="w-full h-full touch-none"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ touchAction: "none", cursor: "grab" }}
        {...bind()}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{
            background: "#0f0f1a",
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "center center",
          }}
          aria-label="Plan du bâtiment Administration"
        >
          {/* Floor watermark */}
          <text
            x="50"
            y="52"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="32"
            fill="white"
            opacity={0.03}
            fontWeight="900"
            style={{ userSelect: "none", pointerEvents: "none" }}
          >
            {floorLabel}
          </text>

          {/* Outer walls */}
          <rect
            x="5"
            y="5"
            width="90"
            height="90"
            fill="none"
            stroke="#334155"
            strokeWidth={0.5}
            rx={1}
          />

          {/* Corridors */}
          {rooms
            .filter((r) => r.type === "corridor")
            .map((room) => (
              <CorridorShape key={room.id} room={room} />
            ))}

          {/* Entrances */}
          {rooms
            .filter((r) => r.type === "entrance")
            .map((room) => (
              <EntranceShape key={room.id} room={room} />
            ))}

          {/* Stairs */}
          {rooms
            .filter((r) => r.type === "stairs")
            .map((room) => (
              <StairsShape key={room.id} room={room} />
            ))}

          {/* Rooms, offices and toilets */}
          {rooms
            .filter(
              (r) =>
                r.type === "room" || r.type === "office" || r.type === "toilet",
            )
            .map((room) => (
              <RoomShape
                key={room.id}
                room={room}
                isDestination={room.id === destinationId}
              />
            ))}

          {/* Routing overlay */}
          {floorRoute.length >= 2 && (
            <IndoorRoutingOverlay route={floorRoute} />
          )}

          {/* -- Legend ---------------------------------------------- */}
          <g>
            <rect
              x="6"
              y="76"
              width="24"
              height="20"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth={0.4}
              rx={0.8}
            />
            {/* Couloir */}
            <rect x="8" y="78.2" width="3" height="1.8" fill="#1e293b" />
            <text x="12.5" y="79.4" fontSize="1.9" fill="#94a3b8">
              Couloir
            </text>
            {/* Salle */}
            <rect
              x="8"
              y="81.4"
              width="3"
              height="1.8"
              fill="#1e2433"
              stroke="#475569"
              strokeWidth={0.3}
            />
            <text x="12.5" y="82.6" fontSize="1.9" fill="#94a3b8">
              Salle
            </text>
            {/* Destination */}
            <rect
              x="8"
              y="84.6"
              width="3"
              height="1.8"
              fill="#1a0808"
              stroke="#B01817"
              strokeWidth={0.3}
            />
            <text x="12.5" y="85.8" fontSize="1.9" fill="#f87171">
              Destination
            </text>
            {/* Escalier */}
            <rect
              x="8"
              y="87.8"
              width="3"
              height="1.8"
              fill="#111827"
              stroke="#475569"
              strokeWidth={0.3}
            />
            <text x="12.5" y="89" fontSize="1.9" fill="#94a3b8">
              Escalier
            </text>
            {/* Entrée */}
            <rect
              x="8"
              y="91"
              width="3"
              height="1.8"
              fill="#0b2012"
              stroke="#22c55e"
              strokeWidth={0.3}
            />
            <text x="12.5" y="92.2" fontSize="1.9" fill="#86efac">
              Entrée
            </text>
          </g>

          {/* North indicator */}
          <g>
            <text
              x="93"
              y="10"
              textAnchor="middle"
              fontSize="2.5"
              fill="#64748b"
            >
              N
            </text>
            <text
              x="93"
              y="8.5"
              textAnchor="middle"
              fontSize="2.5"
              fill="#B01817"
            >
              ▲
            </text>
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
