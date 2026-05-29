"use client";

import { useEffect, useRef } from "react";
import { useMapStore } from "../store/mapStore";

/**
 * Manages the browser Geolocation API watch session.
 * Call `startWatching()` only after a user gesture to avoid
 * triggering the browser permission prompt on page load.
 */
export function useUserLocation() {
  const setUserLocation = useMapStore((s) => s.setUserLocation);
  const setLocationError = useMapStore((s) => s.setLocationError);
  const watchIdRef = useRef<number | null>(null);

  const startWatching = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("geolocation_unsupported");
      return;
    }
    // Avoid duplicate watches
    if (watchIdRef.current !== null) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation([
          position.coords.longitude,
          position.coords.latitude,
        ]);
        setLocationError(null);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("permission_denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("position_unavailable");
            break;
          default:
            setLocationError("timeout");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000,
      },
    );
  };

  const stopWatching = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => () => stopWatching(), []);

  return { startWatching, stopWatching };
}
