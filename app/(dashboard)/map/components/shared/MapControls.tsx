"use client";

import { useCallback, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Locate } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { MapRef } from "react-map-gl/mapbox";
import { INITIAL_VIEW } from "../../data/buildings";
import { useMapStore } from "../../store/mapStore";
import { useUserLocation } from "../../hooks/useUserLocation";
import { isPointInPolygon, CAMPUS_BOUNDARY } from "../../utils/geo";

interface MapControlsProps {
  mapRef: React.RefObject<MapRef | null>;
  /** Called when user resets from indoor mode */
  onIndoorExit?: () => void;
}

export function MapControls({ mapRef, onIndoorExit }: MapControlsProps) {
  const level = useMapStore((s) => s.level);
  const locationError = useMapStore((s) => s.locationError);
  const { triggerTransition, resetMap } = useMapStore();
  const { startWatching } = useUserLocation();
  const [isLocating, setIsLocating] = useState(false);

  const zoom = useCallback(
    (delta: number) => {
      const map = mapRef.current?.getMap();
      if (!map) return;
      map.zoomTo(map.getZoom() + delta, { duration: 200 });
    },
    [mapRef],
  );

  const handleReset = useCallback(() => {
    if (level === "indoor" || level === "transitioning") {
      if (onIndoorExit) {
        onIndoorExit();
      } else {
        triggerTransition("exiting");
        setTimeout(() => resetMap(), 1000);
      }
    } else {
      const map = mapRef.current?.getMap();
      if (map) {
        map.flyTo({ ...INITIAL_VIEW, duration: 700, essential: true });
      }
    }
  }, [level, mapRef, onIndoorExit, triggerTransition, resetMap]);

  /**
   * Request GPS permission on first click, wait up to 5 s for a fix,
   * then fly to the user's position if they are on campus.
   */
  const handleLocate = useCallback(async () => {
    if (locationError === "permission_denied") return;
    setIsLocating(true);
    startWatching();

    // Poll for location (max 5 s)
    const deadline = Date.now() + 5000;
    await new Promise<void>((resolve) => {
      const check = () => {
        const loc = useMapStore.getState().userLocation;
        const err = useMapStore.getState().locationError;
        if (loc || err || Date.now() >= deadline) return resolve();
        setTimeout(check, 200);
      };
      check();
    });

    setIsLocating(false);

    const loc = useMapStore.getState().userLocation;
    const err = useMapStore.getState().locationError;

    if (err === "permission_denied") {
      toast.error("Géolocalisation refusée — mode manuel activé");
      return;
    }
    if (!loc) {
      toast.error("Position introuvable — réessayez");
      return;
    }

    const onCampus = isPointInPolygon(loc, CAMPUS_BOUNDARY);
    if (!onCampus) {
      toast.warning("Vous n'êtes pas sur le campus ENSIAS");
      return;
    }

    toast.success("📍 Localisation activée");
    mapRef.current?.flyTo({
      center: loc,
      zoom: 18,
      duration: 1000,
      essential: true,
    });
  }, [mapRef, locationError, startWatching]);

  return (
    <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
      {/* Zoom buttons — outdoor only */}
      {level === "outdoor" && (
        <>
          <button
            aria-label="Zoom avant"
            onClick={() => zoom(1)}
            className="flex size-8 items-center justify-center rounded-lg bg-[#111827]/90
                       border border-white/10 text-white/60 hover:text-white hover:bg-white/10
                       backdrop-blur-sm transition-colors shadow"
          >
            <ZoomIn size={14} />
          </button>
          <button
            aria-label="Zoom arrière"
            onClick={() => zoom(-1)}
            className="flex size-8 items-center justify-center rounded-lg bg-[#111827]/90
                       border border-white/10 text-white/60 hover:text-white hover:bg-white/10
                       backdrop-blur-sm transition-colors shadow"
          >
            <ZoomOut size={14} />
          </button>

          {/* Locate me button */}
          <button
            aria-label="Me localiser"
            onClick={handleLocate}
            disabled={locationError === "permission_denied" || isLocating}
            title={
              locationError === "permission_denied"
                ? "Géolocalisation refusée"
                : "Me localiser"
            }
            className={`flex size-8 items-center justify-center rounded-lg border
                       backdrop-blur-sm transition-colors shadow
                       ${isLocating
                         ? "bg-blue-600 border-blue-500 text-white"
                         : locationError === "permission_denied"
                         ? "bg-[#111827]/90 border-white/10 text-white/20 cursor-not-allowed"
                         : "bg-[#111827]/90 border-white/10 text-white/60 hover:text-blue-400 hover:border-blue-500/50"
                       }`}
          >
            {isLocating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Locate size={14} />
              </motion.div>
            ) : (
              <Locate size={14} />
            )}
          </button>
        </>
      )}

      {/* Reset — always visible */}
      <button
        aria-label="Réinitialiser"
        onClick={handleReset}
        className="flex size-8 items-center justify-center rounded-lg bg-[#111827]/90
                   border border-white/10 text-white/60 hover:text-white hover:bg-white/10
                   backdrop-blur-sm transition-colors shadow"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
}

