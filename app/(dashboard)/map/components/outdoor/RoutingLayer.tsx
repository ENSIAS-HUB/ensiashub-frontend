"use client";

import { useEffect, useRef } from "react";
import { Source, Layer, useMap } from "react-map-gl/mapbox";
import type { Feature, LineString } from "geojson";

interface RoutingLayerProps {
  route: Feature<LineString>;
}

const ROUTE_SOURCE = "outdoor-route";
const ROUTE_LAYER_GLOW = "route-glow";
const ROUTE_LAYER_LINE = "route-line";
const ROUTE_LAYER_ARROW = "route-arrows";

/**
 * Renders an animated red ENSIAS routing line on the Mapbox canvas.
 * Includes glow effect and animated dash-offset for "flowing" appearance.
 */
export function RoutingLayer({ route }: RoutingLayerProps) {
  const { current: map } = useMap();
  const animRef = useRef<number | null>(null);
  const offsetRef = useRef(0);

  // Animate dash-offset for flowing line effect
  useEffect(() => {
    if (!map) return;

    const animate = () => {
      offsetRef.current = (offsetRef.current + 0.15) % 24;
      if (map.getLayer(ROUTE_LAYER_LINE)) {
        map
          .getMap()
          .setPaintProperty(ROUTE_LAYER_LINE, "line-dasharray", [
            2,
            offsetRef.current,
          ]);
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [map]);

  return (
    <Source id={ROUTE_SOURCE} type="geojson" data={route}>
      {/* Glow layer (blurred thick line underneath) */}
      <Layer
        id={ROUTE_LAYER_GLOW}
        type="line"
        layout={{ "line-join": "round", "line-cap": "round" }}
        paint={{
          "line-color": "#B01817",
          "line-width": 10,
          "line-opacity": 0.25,
          "line-blur": 6,
        }}
      />

      {/* Main route line */}
      <Layer
        id={ROUTE_LAYER_LINE}
        type="line"
        layout={{ "line-join": "round", "line-cap": "round" }}
        paint={{
          "line-color": "#B01817",
          "line-width": 4,
          "line-dasharray": [2, 4],
        }}
      />

      {/* Directional arrows */}
      <Layer
        id={ROUTE_LAYER_ARROW}
        type="symbol"
        layout={{
          "symbol-placement": "line",
          "symbol-spacing": 80,
          "icon-image": "triangle-stroked-15",
          "icon-rotate": 90,
          "icon-rotation-alignment": "map",
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        }}
        paint={{
          "icon-color": "#B01817",
          "icon-opacity": 0.9,
        }}
      />
    </Source>
  );
}
