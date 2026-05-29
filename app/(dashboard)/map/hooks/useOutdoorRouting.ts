/**
 * @deprecated Use useCampusRouting instead.
 * The useOutdoorRouting implementation below is kept for backward compatibility.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { Feature, LineString } from "geojson";
import { useMapStore } from "../store/mapStore";
import { haversineDistance } from "../utils/geo";
import type { RouteInfo } from "../types/map.types";

const MAPBOX_DIRECTIONS = "https://api.mapbox.com/directions/v5/mapbox/walking";

type DirectionsResponse = {
  routes?: Array<{
    geometry: LineString;
    distance: number;
    duration: number;
    legs: Array<{
      steps: Array<{
        maneuver: { instruction: string };
        distance: number;
      }>;
    }>;
  }>;
};

/**
 * Hook that fetches a walking route from the Mapbox Directions API,
 * stores the result in the global map store, and auto-recalculates
 * the route when the user moves more than 20 m from the last origin.
 *
 * Falls back to a straight-line route if the API call fails.
 */
export function useOutdoorRouting() {
  const setActiveRoute = useMapStore((s) => s.setActiveRoute);
  const activeRoute = useMapStore((s) => s.activeRoute);
  const userLocation = useMapStore((s) => s.userLocation);
  const [isLoading, setIsLoading] = useState(false);
  const lastOriginRef = useRef<[number, number] | null>(null);

  const fetchRoute = useCallback(
    async (
      destination: [number, number],
      destinationName: string,
    ): Promise<RouteInfo | null> => {
      const userLoc = useMapStore.getState().userLocation;
      if (!userLoc) {
        toast.error("Activez la geolocalisation pour obtenir un itineraire");
        return null;
      }

      setIsLoading(true);
      lastOriginRef.current = userLoc;

      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      const [fromLng, fromLat] = userLoc;
      const [toLng, toLat] = destination;

      const buildStraightLine = (): RouteInfo => {
        const dist = Math.round(haversineDistance(userLoc, destination));
        const straight: Feature<LineString> = {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [userLoc, destination],
          },
        };
        return {
          geojson: straight,
          distanceMeters: dist,
          durationSeconds: Math.round(dist / 1.4),
          steps: [],
          destinationName,
          destinationCoords: destination,
        };
      };

      try {
        const url =
          `${MAPBOX_DIRECTIONS}/${fromLng},${fromLat};${toLng},${toLat}` +
          `?geometries=geojson&steps=true&language=fr&overview=full&access_token=${token}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`API ${res.status}`);

        const data = (await res.json()) as DirectionsResponse;

        if (!data.routes?.length) throw new Error("No routes");

        const r = data.routes[0];
        const info: RouteInfo = {
          geojson: {
            type: "Feature",
            properties: {},
            geometry: r.geometry,
          },
          distanceMeters: Math.round(r.distance),
          durationSeconds: Math.round(r.duration),
          destinationName,
          destinationCoords: destination,
          steps:
            r.legs[0]?.steps?.map((s) => ({
              instruction: s.maneuver.instruction,
              distanceMeters: Math.round(s.distance),
            })) ?? [],
        };

        setActiveRoute(info);
        const mins = Math.ceil(r.duration / 60);
        const dist =
          r.distance >= 1000
            ? `${(r.distance / 1000).toFixed(1)} km`
            : `${Math.round(r.distance)} m`;
        toast.success(`Itineraire calcule — ${mins} min (${dist})`);
        return info;
      } catch {
        // Network error or no route — draw a straight line as fallback
        const fallback = buildStraightLine();
        setActiveRoute(fallback);
        toast.warning("Itineraire approximatif — connexion limitee");
        return fallback;
      } finally {
        setIsLoading(false);
      }
    },
    [setActiveRoute],
  );

  // Auto-recalculate if the user moves more than 20 m from the last origin
  useEffect(() => {
    if (!activeRoute || !userLocation || !lastOriginRef.current) return;
    const moved = haversineDistance(userLocation, lastOriginRef.current);
    if (moved >= 20) {
      fetchRoute(activeRoute.destinationCoords, activeRoute.destinationName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  const clearRoute = useCallback(() => {
    setActiveRoute(null);
    lastOriginRef.current = null;
  }, [setActiveRoute]);

  return { fetchRoute, clearRoute, isLoading };
}
