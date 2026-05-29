"use client";

import { lazy, Suspense } from "react";
import { useMapStore } from "../../store/mapStore";
import { ADMIN_BUILDING_ROOMS } from "../../data/indoor/admin-building";
import { useIndoorRouting } from "../../hooks/useIndoorRouting";
import { getBuildingById } from "../../data/buildings";
import { MiniMap } from "../minimap/MiniMap";

// Lazy-load the SVG floor plan to avoid SSR issues
const AdminBuilding = lazy(() =>
  import("./buildings/AdminBuilding").then((m) => ({
    default: m.AdminBuilding,
  })),
);

/**
 * Container for the indoor floor-plan view.
 * Selects the correct building SVG component and wires indoor routing.
 */
export function IndoorMap() {
  const { activeBuilding, destination, activeFloor } = useMapStore();
  const building = activeBuilding ? getBuildingById(activeBuilding) : null;

  // Run A* from building entrance to destination
  const route = useIndoorRouting(
    ADMIN_BUILDING_ROOMS,
    destination ? "admin-entrance" : null,
    destination?.roomId ?? null,
  );

  if (!building) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0f0f1a]">
        <p className="text-sm text-white/40">Aucun bâtiment sélectionné</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#0f0f1a]">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <div className="size-8 rounded-full border-2 border-[#B01817] border-t-transparent animate-spin" />
          </div>
        }
      >
        {building.id === "administration" && (
          <AdminBuilding
            activeFloor={activeFloor}
            route={route}
            destinationId={destination?.roomId ?? null}
          />
        )}
      </Suspense>

      {/* Contextual minimap */}
      <MiniMap currentFloor={activeFloor} route={route} />
    </div>
  );
}
