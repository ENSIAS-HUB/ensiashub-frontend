"use client";

import { useCallback, useRef } from "react";
import type { MapRef } from "react-map-gl/mapbox";
import { toast } from "sonner";
import { useMapStore } from "../store/mapStore";
import type { Building } from "../types/map.types";

export function useMapTransition(mapRef: React.RefObject<MapRef | null>) {
  const { triggerTransition, setLevel, setActiveBuilding, setSavedViewport } =
    useMapStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enterBuilding = useCallback(
    (building: Building) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      // Save current viewport so we can restore it on exit
      const center = map.getCenter();
      setSavedViewport({
        longitude: center.lng,
        latitude: center.lat,
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      });

      setActiveBuilding(building.id);
      triggerTransition("entering");

      // Phase 1: Cinematic zoom-plunge (1200ms, easeOutQuad)
      map.flyTo({
        center: building.entryCoordinates,
        zoom: 20.5,
        pitch: 75,
        bearing: 0,
        duration: 1200,
        essential: true,
        easing: (t) => t * (2 - t),
      });

      // Phase 2: Show dark overlay at 700ms (mid-flight)
      timerRef.current = setTimeout(() => {
        setLevel("transitioning");
      }, 700);

      // Phase 3: Switch to indoor at 1400ms (after fly completes)
      timerRef.current = setTimeout(() => {
        setLevel("indoor");
        triggerTransition(null);
        toast.success(`🏛️ Vous entrez : ${building.name}`, { duration: 2500 });
      }, 1400);
    },
    [mapRef, setActiveBuilding, setLevel, setSavedViewport, triggerTransition],
  );

  const exitBuilding = useCallback(() => {
    triggerTransition("exiting");
    setLevel("transitioning");
    toast.info("🗺️ Retour à la vue extérieure", { duration: 1800 });

    timerRef.current = setTimeout(() => {
      setLevel("outdoor");
      setActiveBuilding(null);
      triggerTransition(null);

      const map = mapRef.current?.getMap();
      if (map) {
        // Restore the exact viewport the user had before entering
        const saved = useMapStore.getState().savedViewport;
        if (saved) {
          map.jumpTo({
            center: [saved.longitude, saved.latitude],
            zoom: saved.zoom,
            pitch: saved.pitch,
            bearing: saved.bearing,
          });
        } else {
          map.flyTo({ zoom: 17, pitch: 45, duration: 800, essential: true });
        }
        setSavedViewport(null);
      }
    }, 1000);
  }, [
    mapRef,
    setActiveBuilding,
    setLevel,
    setSavedViewport,
    triggerTransition,
  ]);

  return { enterBuilding, exitBuilding };
}
