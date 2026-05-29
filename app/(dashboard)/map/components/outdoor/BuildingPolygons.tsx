"use client";

import { useMemo } from "react";
import { Source, Layer, Marker } from "react-map-gl/mapbox";
import type { FeatureCollection } from "geojson";
import campusGeoJson from "../../data/campus-geojson";

interface BuildingPolygonsProps {
  onBuildingClick: (buildingId: string) => void;
  hoveredId: string | null;
  /** ID of the currently selected building — drives the selected outline layer */
  selectedId?: string | null;
}

/**
 * IDs of small utility buildings that clutter the map at low zoom.
 * Their labels only appear at zoom ≥ 18.
 */
const SMALL_BUILDING_IDS = [
  "toilette",
  "toilette-2",
  "securite",
  "securite-2",
  "securite-3",
  "buanderie",
  "salle-ablution",
  "salle-de-priere",
];

const BUILDING_FEATURES: FeatureCollection = {
  type: "FeatureCollection",
  features: campusGeoJson.features.filter(
    (f) => f.properties?.type === "building",
  ),
};

const CAMPUS_BOUNDARY: FeatureCollection = {
  type: "FeatureCollection",
  features: campusGeoJson.features.filter(
    (f) => f.properties?.type === "campus",
  ),
};

export function BuildingPolygons({
  onBuildingClick,
  hoveredId,
  selectedId,
}: BuildingPolygonsProps) {
  // Administration centre for the indoor-available marker
  const adminFeature = useMemo(
    () =>
      campusGeoJson.features.find((f) => f.properties?.id === "administration"),
    [],
  );
  const adminCoords = useMemo(() => {
    if (!adminFeature || adminFeature.geometry.type !== "Polygon") return null;
    const coords = adminFeature.geometry.coordinates[0];
    const lng = coords.reduce((s, c) => s + c[0], 0) / coords.length;
    const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
    return [lng, lat] as [number, number];
  }, [adminFeature]);

  return (
    <>
      {/* -- Campus boundary ----------------------------------------- */}
      <Source id="campus-boundary" type="geojson" data={CAMPUS_BOUNDARY}>
        <Layer
          id="campus-boundary-fill"
          type="fill"
          paint={{ "fill-color": "#0f172a", "fill-opacity": 0.35 }}
        />
        <Layer
          id="campus-boundary-outline"
          type="line"
          paint={{
            "line-color": "#B01817",
            "line-width": 2,
            "line-dasharray": [4, 3],
          }}
        />
      </Source>

      {/* -- Buildings ----------------------------------------------- */}
      <Source id="buildings" type="geojson" data={BUILDING_FEATURES}>
        {/* Base fill */}
        <Layer
          id="buildings-fill"
          type="fill"
          paint={{
            "fill-color": [
              "case",
              ["==", ["get", "hasIndoorMap"], true],
              "#2a1515",
              ["in", "terrain", ["get", "id"]],
              "#0f1f13",
              ["in", "parking", ["get", "id"]],
              "#111827",
              "#1e293b",
            ],
            "fill-opacity": 0.7,
          }}
          // @ts-expect-error react-map-gl Layer onClick not in LayerProps typedef
          onClick={(e) => {
            const id = e.features?.[0]?.properties?.id as string | undefined;
            if (id) onBuildingClick(id);
          }}
        />

        {/* Outline */}
        <Layer
          id="buildings-outline"
          type="line"
          paint={{
            "line-color": [
              "case",
              ["==", ["get", "hasIndoorMap"], true],
              "#B01817",
              ["in", "terrain", ["get", "id"]],
              "#166534",
              ["in", "parking", ["get", "id"]],
              "#374151",
              "#334155",
            ],
            "line-width": [
              "case",
              ["==", ["get", "hasIndoorMap"], true],
              1.8,
              1,
            ],
          }}
        />

        {/* Hover highlight — must sit above buildings-fill */}
        <Layer
          id="buildings-hover"
          type="fill"
          filter={["==", ["get", "id"], hoveredId ?? ""]}
          paint={{
            "fill-color": "#B01817",
            "fill-opacity": 0.35,
          }}
        />

        {/* Main building labels — small-building IDs excluded */}
        <Layer
          id="campus-labels"
          type="symbol"
          filter={["!", ["in", ["get", "id"], ["literal", SMALL_BUILDING_IDS]]]}
          layout={{
            "text-field": ["get", "name"],
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              16,
              0,
              17,
              [
                "case",
                ["==", ["get", "hasIndoorMap"], true],
                10,
                [
                  "any",
                  ["in", "amphi", ["downcase", ["get", "id"]]],
                  ["==", ["get", "id"], "grand-amphi"],
                ],
                9,
                8,
              ],
              18,
              [
                "case",
                ["==", ["get", "hasIndoorMap"], true],
                12,
                [
                  "any",
                  ["in", "amphi", ["downcase", ["get", "id"]]],
                  ["==", ["get", "id"], "grand-amphi"],
                ],
                11,
                10,
              ],
              19,
              ["case", ["==", ["get", "hasIndoorMap"], true], 14, 12],
            ],
            "text-anchor": "center",
            "text-max-width": 8,
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            "text-font": [
              "case",
              ["==", ["get", "hasIndoorMap"], true],
              ["literal", ["DIN Offc Pro Bold", "Arial Unicode MS Bold"]],
              ["literal", ["DIN Offc Pro Regular", "Arial Unicode MS Regular"]],
            ],
          }}
          paint={{
            "text-color": [
              "case",
              ["==", ["get", "hasIndoorMap"], true],
              "#B01817",
              [
                "any",
                ["in", "terrain", ["get", "id"]],
                ["==", ["get", "id"], "terrain-gazon"],
              ],
              "#86efac",
              ["in", "parking", ["get", "id"]],
              "#94a3b8",
              [
                "any",
                ["in", "amphi", ["downcase", ["get", "id"]]],
                ["==", ["get", "id"], "grand-amphi"],
              ],
              "#93c5fd",
              "#f1f5f9",
            ],
            "text-halo-color": "#0f172a",
            "text-halo-width": 1.5,
          }}
        />

        {/* Small building labels — only visible at zoom ≥ 18 */}
        <Layer
          id="campus-labels-small"
          type="symbol"
          minzoom={18}
          filter={["in", ["get", "id"], ["literal", SMALL_BUILDING_IDS]]}
          layout={{
            "text-field": ["get", "name"],
            "text-size": ["interpolate", ["linear"], ["zoom"], 18, 8, 19, 10],
            "text-anchor": "center",
            "text-max-width": 6,
            "text-allow-overlap": false,
            "text-font": [
              "literal",
              ["DIN Offc Pro Regular", "Arial Unicode MS Regular"],
            ],
          }}
          paint={{
            "text-color": "#64748b",
            "text-halo-color": "#0f172a",
            "text-halo-width": 1.2,
          }}
        />

        {/* Indoor-available icon — shown above the admin label */}
        <Layer
          id="indoor-available-icon"
          type="symbol"
          filter={["==", ["get", "hasIndoorMap"], true]}
          layout={{
            "text-field": "📐",
            "text-size": 14,
            "text-anchor": "bottom",
            "text-offset": [0, -1.2],
            "text-allow-overlap": true,
          }}
        />
      </Source>
    </>
  );
}
