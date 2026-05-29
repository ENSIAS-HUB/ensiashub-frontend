"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Map, { NavigationControl, Marker, Layer } from "react-map-gl/mapbox";
import type { MapRef, MapMouseEvent } from "react-map-gl/mapbox";
import type mapboxgl from "mapbox-gl";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { BuildingPolygons } from "./BuildingPolygons";
import { RouteLayer } from "./RouteLayer";
import { UserLocationMarker } from "./UserLocationMarker";
import { BuildingPopup } from "./BuildingPopup";
import { RouteInfoPanel } from "./RouteInfoPanel";
import DestinationMarker from "./DestinationMarker";
import { useMapStore } from "../../store/mapStore";
import { useMapTransition } from "../../hooks/useMapTransition";
import { useCampusRouting } from "../../hooks/useCampusRouting";
import { getBuildingById, INITIAL_VIEW } from "../../data/buildings";
import { haversineDistance } from "../../utils/geo";
import {
  BUILDING_ENTRIES,
  getCentroid,
  getBuildingLabel,
} from "../../data/buildings-config";
import type { SelectedBuilding } from "../../types/map.types";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

/** Dark campus style overrides applied once the map finishes loading */
function applyDarkStyle(map: mapboxgl.Map) {
  try {
    map.setPaintProperty("water", "fill-color", "#0a0f1a");
    map.setPaintProperty("land", "background-color", "#0b0d0f");
    if (map.getLayer("building")) {
      map.setPaintProperty("building", "fill-color", "#1e1e2e");
      map.setPaintProperty("building", "fill-opacity", 0.9);
    }
    if (map.getLayer("building-extrusion")) {
      map.setPaintProperty("building-extrusion", "fill-color", "#1e1e2e");
      map.setPaintProperty("building-extrusion", "fill-opacity", 0.85);
    }
    [
      "road-primary",
      "road-secondary-tertiary",
      "road-street",
      "road-minor",
    ].forEach((layer) => {
      if (map.getLayer(layer)) {
        map.setPaintProperty(layer, "line-color", "#1e293b");
      }
    });
  } catch {
    // Non-critical — style may not have all layers in every Mapbox version
  }
}

/** Floating tooltip shown on building hover */
interface TooltipState {
  x: number;
  y: number;
  name: string;
  hasIndoorMap: boolean;
}

interface OutdoorMapProps {
  mapRef: React.RefObject<MapRef | null>;
}

/**
 * Renders the outdoor Mapbox campus map with building polygons,
 * hover tooltips, routing layer, and entry prompt.
 */
export function OutdoorMap({ mapRef }: OutdoorMapProps) {
  // Atomic selectors — component re-renders only when these slices change
  const selectedBuilding = useMapStore((s) => s.selectedBuilding);
  const activeRoute = useMapStore((s) => s.activeRoute);
  const userLocation = useMapStore((s) => s.userLocation);
  const setSelectedBuilding = useMapStore((s) => s.setSelectedBuilding);
  const { enterBuilding } = useMapTransition(mapRef);
  const { fetchRoute } = useCampusRouting();

  // Auto-recalculate route when user moves more than 20 m
  const prevLocationRef = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (!userLocation || !activeRoute) return;
    if (prevLocationRef.current) {
      const moved = haversineDistance(prevLocationRef.current, userLocation);
      if (moved > 20) {
        fetchRoute(activeRoute.destinationCoords, activeRoute.destinationName);
      }
    }
    prevLocationRef.current = userLocation;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) {
      applyDarkStyle(map as unknown as mapboxgl.Map);
      setMapReady(true);
    }
  }, [mapRef]);

  const handleMouseMove = useCallback(
    (e: MapMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map || !map.isStyleLoaded()) return;
      if (!map.getLayer("buildings-fill")) return;
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["buildings-fill"],
      });
      if (features.length > 0) {
        const f = features[0];
        const id = f.properties?.id as string;
        setHoveredId(id);
        setTooltip({
          x: e.originalEvent.offsetX,
          y: e.originalEvent.offsetY,
          name: (f.properties?.name as string) ?? id,
          hasIndoorMap: f.properties?.hasIndoorMap === true,
        });
        map.getCanvas().style.cursor = "pointer";
      } else {
        setHoveredId(null);
        setTooltip(null);
        map.getCanvas().style.cursor = "";
      }
    },
    [mapRef],
  );

  const handleMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) map.getCanvas().style.cursor = "";
    setHoveredId(null);
    setTooltip(null);
  }, [mapRef]);

  /**
   * Primary click handler for all building selection AND empty-space closing.
   * Queries ALL rendered features so it catches clicks on hover/outline layers
   * that sit on top of buildings-fill.
   */
  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map || !map.isStyleLoaded()) return;

      // Query without a layer filter — catches clicks on any layer
      const features = map.queryRenderedFeatures(e.point);
      console.log(
        "[OutdoorMap] click features:",
        features.map((f) => ({ layer: f.layer?.id, id: f.properties?.id })),
      );

      // Find the first feature that carries a building identity
      const buildingFeature = features.find(
        (f) => f.properties?.id && f.properties?.name,
      );

      if (!buildingFeature) {
        setSelectedBuilding(null);
        setTooltip(null);
        setHoveredId(null);
        return;
      }

      const props = buildingFeature.properties!;
      const geometry = buildingFeature.geometry;

      const entryCoords: [number, number] =
        BUILDING_ENTRIES[props.id as string] ??
        (geometry.type === "Polygon"
          ? getCentroid(geometry.coordinates[0] as number[][])
          : [-6.8677, 33.9835]);

      setSelectedBuilding({
        id: props.id as string,
        name: props.name as string,
        hasIndoorMap: props.hasIndoorMap === true,
        coordinates: entryCoords,
      });
    },
    [mapRef, setSelectedBuilding],
  );

  /** Called by BuildingPolygons Layer onClick */
  const handleBuildingClick = useCallback(
    (buildingId: string) => {
      const geo = getBuildingById(buildingId);
      const coords: [number, number] =
        BUILDING_ENTRIES[buildingId] ??
        geo?.entryCoordinates ??
        ([-6.8677, 33.9835] as [number, number]);

      const building: SelectedBuilding = {
        id: buildingId,
        name: (geo?.name) ?? getBuildingLabel(buildingId),
        hasIndoorMap: geo?.hasIndoorMap ?? false,
        coordinates: coords,
      };
      setSelectedBuilding(building);
    },
    [setSelectedBuilding],
  );

  const handleExplore = useCallback(() => {
    if (!selectedBuilding) return;
    const building = getBuildingById(selectedBuilding.id);
    if (building) {
      enterBuilding(building);
      setSelectedBuilding(null);
    }
  }, [selectedBuilding, enterBuilding, setSelectedBuilding]);

  if (!TOKEN) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0b0d0f]">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-white/10 bg-white/5 max-w-sm text-center">
          <AlertTriangle size={28} className="text-yellow-500" />
          <p className="text-sm font-semibold text-white">
            La carte n&apos;est pas disponible.
          </p>
          <p className="text-xs text-white/50">
            Token Mapbox manquant. Contactez l&apos;administrateur.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        initialViewState={INITIAL_VIEW}
        minZoom={15}
        maxZoom={20}
        onLoad={handleLoad}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleMapClick}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {/* User GPS position — only render after map is fully loaded */}
        {mapReady && <UserLocationMarker />}

        {/* Destination marker (animated pulse) — only render after map is fully loaded */}
        {mapReady && <DestinationMarker />}

        {/* Plan interieur badge — non-interactive so clicks reach handleMapClick */}
        <Marker longitude={-6.8678} latitude={33.9841} anchor="bottom">
          <motion.div
            className="pointer-events-none flex items-center gap-1.5 px-2 py-1
                       rounded-full bg-[#111827]/90 border border-[#B01817]/60
                       text-white text-[11px] font-medium shadow-lg backdrop-blur-sm"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Plan interieur
          </motion.div>
        </Marker>

        {/* Building polygon fills, hover highlight, labels */}
        <BuildingPolygons
          onBuildingClick={handleBuildingClick}
          hoveredId={hoveredId}
          selectedId={selectedBuilding?.id ?? null}
        />

        {/* Selected building outline — references the "buildings" source */}
        <Layer
          id="buildings-selected"
          source="buildings"
          type="line"
          filter={["==", ["get", "id"], selectedBuilding?.id ?? ""]}
          paint={{
            "line-color": "#B01817",
            "line-width": 2.5,
            "line-opacity": 0.9,
          }}
        />

        {/* Hover highlight on buildings */}
        <Layer
          id="buildings-hover"
          source="buildings"
          type="fill"
          filter={["==", ["get", "id"], hoveredId ?? ""]}
          paint={{
            "fill-color": "#ffffff",
            "fill-opacity": 0.08,
          }}
        />

        {/* Animated walking route */}
        <RouteLayer mapRef={mapRef} />
      </Map>

      {/* Hover tooltip (hidden while popup/panel is open) */}
      <AnimatePresence>
        {tooltip && !selectedBuilding && !activeRoute && (
          <motion.div
            key="map-tooltip"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute z-30 rounded-lg border border-slate-700
                       bg-slate-800/90 backdrop-blur-sm px-3 py-2 shadow-lg"
            style={{
              left: tooltip.x + 14,
              top: tooltip.y - 10,
              maxWidth: 200,
            }}
          >
            <p className="text-sm font-medium text-white leading-tight">
              {tooltip.name}
            </p>
            {tooltip.hasIndoorMap && (
              <p className="text-[11px] text-[#B01817] mt-0.5">
                Cliquez pour explorer
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Building popup or route info panel — mutually exclusive */}
      <AnimatePresence mode="wait">
        {activeRoute ? (
          <RouteInfoPanel key="route-panel" />
        ) : selectedBuilding ? (
          <BuildingPopup
            key={`popup-${selectedBuilding.id}`}
            building={selectedBuilding}
            onClose={() => setSelectedBuilding(null)}
            onExplore={handleExplore}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
