import type { Building } from "../types/map.types";

export const BUILDINGS: Building[] = [
  {
    id: "administration",
    name: "Administration",
    shortName: "Admin",
    // Centre of the real admin polygon
    coordinates: [-6.8678, 33.9842] as [number, number],
    entryCoordinates: [-6.8677306, 33.9840586] as [number, number],
    hasIndoorMap: true,
    floors: ["RDC", "1er étage"],
    color: "#B01817",
  },
  {
    id: "grand-amphi",
    name: "Grand Amphi",
    shortName: "G. Amphi",
    coordinates: [-6.8677, 33.9838] as [number, number],
    entryCoordinates: [-6.8677197, 33.9836957] as [number, number],
    hasIndoorMap: false,
    floors: ["RDC"],
    color: "#334155",
  },
  {
    id: "amphi-1",
    name: "Amphi 1",
    shortName: "Amphi 1",
    coordinates: [-6.8672, 33.9848] as [number, number],
    entryCoordinates: [-6.8671083, 33.9847485] as [number, number],
    hasIndoorMap: false,
    floors: ["RDC"],
    color: "#334155",
  },
  {
    id: "amphi-2",
    name: "Amphi 2",
    shortName: "Amphi 2",
    coordinates: [-6.867, 33.9846] as [number, number],
    entryCoordinates: [-6.8669353, 33.9845008] as [number, number],
    hasIndoorMap: false,
    floors: ["RDC"],
    color: "#334155",
  },
  {
    id: "salle-de-tp",
    name: "Salle de TP",
    shortName: "TP",
    coordinates: [-6.8674, 33.9845] as [number, number],
    entryCoordinates: [-6.8674696, 33.9843977] as [number, number],
    hasIndoorMap: false,
    floors: ["RDC"],
    color: "#334155",
  },
  {
    id: "batiment-a",
    name: "Bâtiment A",
    shortName: "Bat. A",
    coordinates: [-6.8679, 33.9831] as [number, number],
    entryCoordinates: [-6.8675709, 33.982956] as [number, number],
    hasIndoorMap: false,
    floors: ["RDC", "1er étage", "2ème étage"],
    color: "#334155",
  },
  {
    id: "batiment-b",
    name: "Bâtiment B",
    shortName: "Bat. B",
    coordinates: [-6.8676, 33.9835] as [number, number],
    entryCoordinates: [-6.8674706, 33.9835077] as [number, number],
    hasIndoorMap: false,
    floors: ["RDC", "1er étage"],
    color: "#334155",
  },
  {
    id: "batiment-c",
    name: "Bâtiment C",
    shortName: "Bat. C",
    coordinates: [-6.8674, 33.9833] as [number, number],
    entryCoordinates: [-6.867415, 33.9831114] as [number, number],
    hasIndoorMap: false,
    floors: ["RDC", "1er étage"],
    color: "#334155",
  },
  {
    id: "batiment-d",
    name: "Bâtiment D",
    shortName: "Bat. D",
    coordinates: [-6.8666, 33.9842] as [number, number],
    entryCoordinates: [-6.8666847, 33.9839855] as [number, number],
    hasIndoorMap: false,
    floors: ["RDC", "1er étage"],
    color: "#334155",
  },
  {
    id: "batiment-e",
    name: "Bâtiment E",
    shortName: "Bat. E",
    coordinates: [-6.8663, 33.9846] as [number, number],
    entryCoordinates: [-6.8663498, 33.9843288] as [number, number],
    hasIndoorMap: false,
    floors: ["RDC", "1er étage"],
    color: "#334155",
  },
];

/** Look up a building by id — returns undefined if not found */
export function getBuildingById(id: string): Building | undefined {
  return BUILDINGS.find((b) => b.id === id);
}

/** Campus main entrance (south gate) */
export const CAMPUS_ENTRANCE: [number, number] = [-6.8677099, 33.9827572];

/** Mapbox initial view — centred on the real ENSIAS campus */
export const INITIAL_VIEW = {
  longitude: -6.8675,
  latitude: 33.9843,
  zoom: 17.2,
  pitch: 45,
  bearing: -15,
} as const;
