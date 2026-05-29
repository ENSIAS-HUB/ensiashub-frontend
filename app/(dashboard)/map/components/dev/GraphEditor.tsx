"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Source, Layer } from "react-map-gl/mapbox";
import campusPathsJson from "../../data/campus-paths.json";
import type { FeatureCollection } from "geojson";

/**
 * DEV-ONLY tool for visually inspecting the campus-paths GeoJSON graph.
 *
 * - Renders a yellow toggle button fixed to the top-right corner
 *   (via React portal to escape the Mapbox canvas).
 * - When visible, draws all path LineStrings in yellow dashed lines
 *   directly on the map.
 * - Returns null in production — tree-shaken by the bundler.
 *
 * This component MUST be placed inside <Map> so that Source/Layer
 * can access the Mapbox map context.
 */
export default function GraphEditor() {
  const [visible, setVisible] = useState(false);
  const [domReady, setDomReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDomReady(true);
  }, []);

  if (process.env.NODE_ENV !== "development") return null;

  const pathsData = campusPathsJson as unknown as FeatureCollection;

  return (
    <>
      {/* Toggle button — rendered outside the Mapbox canvas via portal */}
      {domReady &&
        createPortal(
          <button
            onClick={() => setVisible((v) => !v)}
            className="fixed top-20 right-4 z-[9999] px-3 py-1.5
                       bg-yellow-500 text-black text-xs font-bold
                       rounded-lg shadow-lg hover:bg-yellow-400
                       transition-colors"
          >
            {visible ? "Masquer graphe" : "Afficher graphe"}
          </button>,
          document.body,
        )}

      {/* Campus-paths debug layer */}
      {visible && (
        <Source id="campus-paths-debug" type="geojson" data={pathsData}>
          <Layer
            id="campus-paths-debug-line"
            type="line"
            paint={{
              "line-color": "#facc15",
              "line-width": 2,
              "line-opacity": 0.9,
              "line-dasharray": [2, 1],
            }}
          />
        </Source>
      )}
    </>
  );
}
