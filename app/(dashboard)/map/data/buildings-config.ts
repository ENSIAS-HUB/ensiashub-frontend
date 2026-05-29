/**
 * GPS entry coordinates for all campus buildings.
 * Used to calculate walking routes when a building ID is clicked.
 */
export const BUILDING_ENTRIES: Record<string, [number, number]> = {
  "administration": [-6.8678, 33.9842],
  "batiment-a": [-6.8679, 33.9829],
  "batiment-b": [-6.8676, 33.9834],
  "batiment-c": [-6.8674, 33.9832],
  "batiment-d": [-6.8667, 33.9842],
  "batiment-e": [-6.8663, 33.9846],
  "grand-amphi": [-6.8677, 33.9838],
  "amphi-1": [-6.8672, 33.9848],
  "amphi-2": [-6.8670, 33.9846],
  "amphi-3": [-6.8669, 33.9850],
  "amphi-4": [-6.8667, 33.9849],
  "salle-de-tp": [-6.8674, 33.9845],
  "salle-de-td-1": [-6.8670, 33.9849],
  "salle-de-td-2": [-6.8668, 33.9847],
  "foyer": [-6.8664, 33.9845],
  "agora": [-6.8668, 33.9849],
  "terrain-de-sport": [-6.8671, 33.9838],
  "terrain-de-volley": [-6.8672, 33.9836],
  "terrain-de-basket": [-6.8671, 33.9839],
  "terrain-de-football": [-6.8669, 33.9840],
  "terrain-gazon": [-6.8675, 33.9850],
  "parking-public": [-6.8674, 33.9840],
  "parking-administration": [-6.8679, 33.9846],
  "service-de-scolarite": [-6.8683, 33.9834],
  "ancienne-scolarite-1": [-6.8680, 33.9837],
  "ancienne-scolarite-2": [-6.8683, 33.9838],
  "bureaux-des-professeurs": [-6.8671, 33.9843],
  "buvette": [-6.8663, 33.9846],
  "buvette-des-professeurs": [-6.8684, 33.9839],
  "epicerie": [-6.8677, 33.9832],
  "securite": [-6.8675, 33.9830],
  "securite-2": [-6.8689, 33.9839],
  "securite-3": [-6.8682, 33.9847],
};

/**
 * Computes the centroid of a polygon ring (array of [lng, lat] positions).
 * Fallback when a building has no entry in BUILDING_ENTRIES.
 */
export function getCentroid(coords: number[][]): [number, number] {
  if (!coords.length) return [0, 0];
  const lng = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
  return [lng, lat];
}

/**
 * Returns a human-readable label for a building based on its ID.
 */
export function getBuildingLabel(id: string): string {
  if (id === "administration") return "Administration";
  if (id.includes("amphi")) return "Amphitheatre";
  if (id.includes("batiment")) return "Batiment";
  if (id.includes("terrain-gazon")) return "Terrain de Gazon";
  if (id.includes("terrain")) return "Terrain de Sport";
  if (id.includes("parking")) return "Parking";
  if (id.includes("salle")) return "Salle";
  if (id.includes("securite")) return "Securite";
  if (id.includes("buvette") || id.includes("epicerie")) return "Restauration";
  if (id.includes("foyer")) return "Foyer";
  if (id === "agora") return "Agora";
  return "Batiment";
}
