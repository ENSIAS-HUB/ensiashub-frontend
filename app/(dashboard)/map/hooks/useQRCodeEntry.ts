"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ADMIN_BUILDING_ROOMS } from "../data/indoor/admin-building";
import { getBuildingById } from "../data/buildings";
import { useMapStore } from "../store/mapStore";

/**
 * Reads QR code deep-link query parameters and auto-navigates into the
 * correct building room on page load.
 *
 * Supported query params:
 *   ?entry=administration&room=admin-directeur-office
 */
export function useQRCodeEntry() {
  const searchParams = useSearchParams();
  const { setDestination, setActiveFloor, setLevel, enterBuilding } =
    useMapStore();

  useEffect(() => {
    const entry = searchParams.get("entry");
    const roomId = searchParams.get("room");
    if (!entry || !roomId) return;

    const building = getBuildingById(entry);
    if (!building) return;

    const room = ADMIN_BUILDING_ROOMS.find((r) => r.id === roomId);
    if (!room) return;

    toast.info(`📷 QR détecté : ${room.name}`, { duration: 3000 });

    // Short delay so the map has time to initialise
    const timer = setTimeout(() => {
      setDestination({ label: room.name, buildingId: entry, roomId });
      setActiveFloor(room.floor);
      // enterBuilding sets level: "transitioning" and activeBuilding
      enterBuilding(building.id);
      // Advance straight to indoor (no cinematic flyTo for QR deep-link)
      setTimeout(() => setLevel("indoor"), 200);
    }, 1500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
