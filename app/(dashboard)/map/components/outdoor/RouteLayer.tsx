"use client";

import { Source, Layer } from "react-map-gl/mapbox";
import { useEffect, useRef } from "react";
import type { MapRef } from "react-map-gl/mapbox";
import { useMapStore } from "../../store/mapStore";

// Frames for the animated dash-array (directional flow effect)
const DASH_FRAMES = [
  [0, 4, 3],
  [0.5, 4, 2.5],
  [1, 4, 2],
  [1.5, 4, 1.5],
  [2, 4, 1],
  [2.5, 4, 0.5],
  [3, 4, 0],
  [0, 4, 3],
];

interface RouteLayerProps {
  mapRef: React.RefObject<MapRef | null>;
}

/**
 * Renders the active walking route on the outdoor map as an animated red line.
 * Reads route geometry from the global store (activeRoute.geojson).
 */
export function RouteLayer({ mapRef }: RouteLayerProps) {
  const activeRoute = useMapStore((s) => s.activeRoute);
  const stepRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!activeRoute) return;

    function animateDash() {
      const map = mapRef.current?.getMap();
      if (!map || !map.getLayer("route-dash")) return;

      map.setPaintProperty(
        "route-dash",
        "line-dasharray",
        DASH_FRAMES[stepRef.current],
      );
      stepRef.current = (stepRef.current + 1) % DASH_FRAMES.length;
      timerRef.current = setTimeout(animateDash, 80);
    }

    animateDash();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeRoute, mapRef]);

  if (!activeRoute) return null;

  return (
    <Source id="active-route" type="geojson" data={activeRoute.geojson}>
      {/* Soft glow halo */}
      <Layer
        id="route-glow"
        type="line"
        layout={{ "line-cap": "round", "line-join": "round" }}
        paint={{
          "line-color": "#B01817",
          "line-width": 12,
          "line-opacity": 0.12,
          "line-blur": 6,
        }}
      />
      {/* Dark backing track */}
      <Layer
        id="route-bg"
        type="line"
        layout={{ "line-cap": "round", "line-join": "round" }}
        paint={{
          "line-color": "#7f1d1d",
          "line-width": 6,
          "line-opacity": 0.5,
        }}
      />
      {/* Main route line */}
      <Layer
        id="route-main"
        type="line"
        layout={{ "line-cap": "round", "line-join": "round" }}
        paint={{
          "line-color": "#B01817",
          "line-width": 4,
          "line-opacity": 1,
        }}
      />
      {/* Animated dashes (directional flow) */}
      <Layer
        id="route-dash"
        type="line"
        layout={{ "line-cap": "round", "line-join": "round" }}
        paint={{
          "line-color": "#ffffff",
          "line-width": 2,
          "line-opacity": 0.5,
          "line-dasharray": [0, 4, 3],
        }}
      />
    </Source>
  );
}
