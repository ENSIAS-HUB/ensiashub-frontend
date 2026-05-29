import type { RoomNode } from "../types/map.types";

/** Euclidean distance between two RoomNodes in SVG space */
function dist(a: RoomNode, b: RoomNode): number {
  return Math.sqrt((a.svgX - b.svgX) ** 2 + (a.svgY - b.svgY) ** 2);
}

/**
 * A* pathfinding over the indoor room graph.
 *
 * @param rooms  - Full topology of the building
 * @param startId - ID of the starting node
 * @param endId   - ID of the destination node
 * @returns Ordered array of RoomNodes representing the optimal path,
 *          or an empty array if no path exists.
 */
export function astar(
  rooms: RoomNode[],
  startId: string,
  endId: string,
): RoomNode[] {
  const byId = new Map(rooms.map((r) => [r.id, r]));

  const start = byId.get(startId);
  const end = byId.get(endId);
  if (!start || !end) return [];
  if (startId === endId) return [start];

  const openSet = new Set<string>([startId]);
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>(rooms.map((r) => [r.id, Infinity]));
  const fScore = new Map<string, number>(rooms.map((r) => [r.id, Infinity]));

  gScore.set(startId, 0);
  fScore.set(startId, dist(start, end));

  while (openSet.size > 0) {
    // Pick node in openSet with lowest fScore
    let current = "";
    let lowestF = Infinity;
    for (const id of openSet) {
      const f = fScore.get(id) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        current = id;
      }
    }

    if (current === endId) {
      // Reconstruct path
      const path: RoomNode[] = [];
      let node: string | undefined = endId;
      while (node) {
        const room = byId.get(node);
        if (room) path.unshift(room);
        node = cameFrom.get(node);
      }
      return path;
    }

    openSet.delete(current);
    const currentNode = byId.get(current);
    if (!currentNode) continue;

    for (const neighborId of currentNode.connectedTo) {
      const neighbor = byId.get(neighborId);
      if (!neighbor) continue;

      const tentativeG =
        (gScore.get(current) ?? Infinity) + dist(currentNode, neighbor);
      if (tentativeG < (gScore.get(neighborId) ?? Infinity)) {
        cameFrom.set(neighborId, current);
        gScore.set(neighborId, tentativeG);
        fScore.set(neighborId, tentativeG + dist(neighbor, end));
        openSet.add(neighborId);
      }
    }
  }

  return []; // No path found
}

/**
 * Hook wrapper that runs the A* search and returns the result.
 * Re-uses the pure `astar` function — kept separate so the hook
 * can be extended with caching/memo in the future.
 */
export function useIndoorRouting(
  rooms: RoomNode[],
  startId: string | null,
  endId: string | null,
): RoomNode[] {
  if (!startId || !endId) return [];
  return astar(rooms, startId, endId);
}
