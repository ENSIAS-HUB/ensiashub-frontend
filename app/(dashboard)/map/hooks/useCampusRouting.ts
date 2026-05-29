"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import type { Feature, LineString } from "geojson";
import { useMapStore } from "../store/mapStore";
import { haversineDistance } from "../utils/geo";

// GeoJSON import — type assertion is the only 'any' pattern used here
import campusPathsJson from "../data/campus-paths.json";

interface CampusPathsData {
  features: ReadonlyArray<{
    geometry: { type: string; coordinates: number[][] };
  }>;
}
const campusPaths = campusPathsJson as unknown as CampusPathsData;

// ── Graph types ───────────────────────────────────────────────────

interface GraphNode {
  id: string;
  coords: [number, number];
  neighbors: Map<string, number>; // neighbor id → distance in metres
}

// ── Graph construction — runs once at module load ─────────────────

const SNAP_METERS = 10;

function buildGraph(): Map<string, GraphNode> {
  const graph = new Map<string, GraphNode>();

  function getOrCreate(raw: number[]): string {
    const c: [number, number] = [raw[0], raw[1]];
    for (const node of graph.values()) {
      if (haversineDistance(node.coords, c) <= SNAP_METERS) return node.id;
    }
    const id = `${c[0].toFixed(7)},${c[1].toFixed(7)}`;
    graph.set(id, { id, coords: c, neighbors: new Map() });
    return id;
  }

  for (const feature of campusPaths.features) {
    if (feature.geometry.type !== "LineString") continue;
    const pts = feature.geometry.coordinates;
    if (pts.length < 2) continue;

    const ids: string[] = pts.map(getOrCreate);
    for (let i = 1; i < ids.length; i++) {
      const a = ids[i - 1];
      const b = ids[i];
      if (a === b) continue;
      const dist = haversineDistance(graph.get(a)!.coords, graph.get(b)!.coords);
      graph.get(a)!.neighbors.set(b, dist);
      graph.get(b)!.neighbors.set(a, dist);
    }
  }

  return graph;
}

const GRAPH = buildGraph();

// ── Dijkstra ──────────────────────────────────────────────────────

function dijkstra(startId: string, endId: string): string[] {
  if (startId === endId) return [startId];

  const dist = new Map<string, number>();
  const prev = new Map<string, string>();
  const unvisited = new Set<string>(GRAPH.keys());

  for (const id of GRAPH.keys()) dist.set(id, Infinity);
  dist.set(startId, 0);

  while (unvisited.size > 0) {
    let current: string | null = null;
    let minD = Infinity;
    for (const id of unvisited) {
      const d = dist.get(id) ?? Infinity;
      if (d < minD) {
        minD = d;
        current = id;
      }
    }

    if (!current || minD === Infinity) break;
    if (current === endId) break;

    unvisited.delete(current);
    const node = GRAPH.get(current)!;
    for (const [nbId, w] of node.neighbors) {
      if (!unvisited.has(nbId)) continue;
      const alt = (dist.get(current) ?? Infinity) + w;
      if (alt < (dist.get(nbId) ?? Infinity)) {
        dist.set(nbId, alt);
        prev.set(nbId, current);
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let node = endId;
  while (prev.has(node)) {
    path.unshift(node);
    node = prev.get(node)!;
  }
  if (path.length > 0) path.unshift(startId);
  return path;
}

// ── Helpers ───────────────────────────────────────────────────────

/** Returns up to `count` nearest graph nodes, sorted by distance. */
function nearestNodes(coords: [number, number], count = 3): GraphNode[] {
  return Array.from(GRAPH.values())
    .map((node) => ({ node, dist: haversineDistance(coords, node.coords) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count)
    .map((x) => x.node);
}

function pathDistance(coords: [number, number][]): number {
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    total += haversineDistance(coords[i], coords[i + 1]);
  }
  return Math.round(total);
}

/**
 * Remove intermediate nodes that cause visible back-tracking.
 * Any 3 consecutive points whose middle vector reverses direction
 * (cosAngle < -0.5, i.e. angle > 120°) is dropped.
 * The first and last points are always kept.
 */
function smoothPath(coords: [number, number][]): [number, number][] {
  if (coords.length <= 2) return coords;
  const result: [number, number][] = [coords[0]];
  for (let i = 1; i < coords.length - 1; i++) {
    const prev = result[result.length - 1];
    const curr = coords[i];
    const next = coords[i + 1];
    const v1 = [curr[0] - prev[0], curr[1] - prev[1]];
    const v2 = [next[0] - curr[0], next[1] - curr[1]];
    const dot = v1[0] * v2[0] + v1[1] * v2[1];
    const mag1 = Math.sqrt(v1[0] ** 2 + v1[1] ** 2);
    const mag2 = Math.sqrt(v2[0] ** 2 + v2[1] ** 2);
    if (mag1 === 0 || mag2 === 0) continue;
    if (dot / (mag1 * mag2) < -0.5) continue; // back-track → skip
    result.push(curr);
  }
  result.push(coords[coords.length - 1]);
  return result;
}

// ── Hook ──────────────────────────────────────────────────────────

export function useCampusRouting() {
  const setActiveRoute = useMapStore((s) => s.setActiveRoute);
  const userLocation = useMapStore((s) => s.userLocation);

  const fetchRoute = useCallback(
    (destinationCoords: [number, number], destinationName: string) => {
      if (!userLocation) {
        toast.error("Activez la geolocalisation pour obtenir un itineraire");
        return;
      }

      const startCandidates = nearestNodes(userLocation, 3);
      const endCandidates = nearestNodes(destinationCoords, 3);

      // Try all start×end combinations; keep the shortest graph path
      let bestRoute: [number, number][] | null = null;
      let bestDist = Infinity;

      for (const startNode of startCandidates) {
        for (const endNode of endCandidates) {
          if (startNode.id === endNode.id) continue;
          const pathIds = dijkstra(startNode.id, endNode.id);
          if (pathIds.length < 2) continue;
          const coords: [number, number][] = [
            userLocation,
            ...pathIds.map((id) => GRAPH.get(id)!.coords),
            destinationCoords,
          ];
          const d = pathDistance(coords);
          if (d < bestDist) {
            bestDist = d;
            bestRoute = coords;
          }
        }
      }

      const foundPath = bestRoute !== null;

      if (!bestRoute) {
        toast.warning("Chemin non trouve — affichage en ligne droite");
        bestRoute = [userLocation, destinationCoords];
      }

      const smoothed = smoothPath(bestRoute);
      const finalDist = pathDistance(smoothed);

      const routeGeojson: Feature<LineString> = {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: smoothed },
      };

      setActiveRoute({
        geojson: routeGeojson,
        distanceMeters: finalDist,
        durationSeconds: Math.ceil(finalDist / 1.4),
        destinationName,
        destinationCoords,
        steps: [],
      });
    },
    [setActiveRoute, userLocation],
  );

  const clearRoute = useCallback(() => {
    setActiveRoute(null);
  }, [setActiveRoute]);

  return { fetchRoute, clearRoute };
}

