/**
 * Ray-casting algorithm to test whether a point is inside a polygon.
 * Works with GeoJSON-style [longitude, latitude] coordinates.
 */
export function isPointInPolygon(
  point: [number, number],
  polygon: number[][],
): boolean {
  const [px, py] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Approximate boundary of the ENSIAS campus extracted from the GeoJSON.
 * Used to determine if the user is on campus before flying to their location.
 */
export const CAMPUS_BOUNDARY: number[][] = [
  [-6.8692422, 33.9837189],
  [-6.8677099, 33.9827572],
  [-6.865866, 33.9845948],
  [-6.8674952, 33.9856372],
  [-6.8692422, 33.9837189],
];

/**
 * Great-circle distance in metres between two [lng, lat] coordinates
 * using the Haversine formula.
 */
export function haversineDistance(
  [lng1, lat1]: [number, number],
  [lng2, lat2]: [number, number],
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
