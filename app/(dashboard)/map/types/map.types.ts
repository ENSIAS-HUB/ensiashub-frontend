import type { Feature, LineString } from "geojson";

// -- Outdoor route with distance/duration metadata ----------------------------
export type OutdoorRouteFeature = Feature<
  LineString,
  { distance: number; duration: number }
>;

// -- Turn-by-turn routing step ------------------------------------------------
export interface RouteStep {
  instruction: string;
  distanceMeters: number;
}

// -- Rich route info returned by the Directions API ---------------------------
export interface RouteInfo {
  geojson: Feature<LineString>;
  distanceMeters: number;
  durationSeconds: number;
  steps: RouteStep[];
  destinationName: string;
  destinationCoords: [number, number];
}

// -- Selected building (from map click) ---------------------------------------
export interface SelectedBuilding {
  id: string;
  name: string;
  hasIndoorMap: boolean;
  coordinates: [number, number];
  noRouting?: boolean;
}

// -- View levels --------------------------------------------------------------

export type MapLevel = "outdoor" | "transitioning" | "indoor";
export type TransitionDirection = "entering" | "exiting" | null;

// -- Indoor topology -----------------------------------------------------------

export type RoomType =
  | "room"
  | "corridor"
  | "stairs"
  | "entrance"
  | "elevator"
  | "office"
  | "toilet";

export interface RoomNode {
  /** Unique identifier used for routing */
  id: string;
  /** Display name shown in the UI */
  name: string;
  /** Semantic type of the space */
  type: RoomType;
  /** 0 = ground floor, 1 = first floor, … */
  floor: number;
  /** Horizontal position in the 0–100 SVG coordinate space */
  svgX: number;
  /** Vertical position in the 0–100 SVG coordinate space */
  svgY: number;
  /** Width in SVG units */
  width: number;
  /** Height in SVG units */
  height: number;
  /** IDs of adjacent nodes used by the A* pathfinder */
  connectedTo: string[];
  /** Optional emoji icon for display */
  icon?: string;
  /** Optional description shown in room popup */
  description?: string;
}

// -- Building metadata ---------------------------------------------------------

export interface Building {
  id: string;
  name: string;
  shortName: string;
  /** Mapbox centre [lng, lat] */
  coordinates: [number, number];
  /** GPS position of the main door */
  entryCoordinates: [number, number];
  hasIndoorMap: boolean;
  floors: string[];
  color: string;
}

// -- Destination ---------------------------------------------------------------

export interface Destination {
  label: string;
  roomId: string;
  buildingId: string;
}

// -- Search suggestion ---------------------------------------------------------

export type SuggestionKind = "room" | "building";

export interface SearchSuggestion {
  kind: SuggestionKind;
  label: string;
  sublabel: string;
  roomId?: string;
  buildingId: string;
}

// -- Saved viewport (for restoring outdoor view after indoor exit) -------------

export interface SavedViewport {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

// -- Store shape ---------------------------------------------------------------

export interface MapStore {
  level: MapLevel;
  activeBuilding: string | null;
  destination: Destination | null;
  outdoorRoute: OutdoorRouteFeature | null;
  indoorRoute: RoomNode[] | null;
  transitionDirection: TransitionDirection;
  userLocation: [number, number] | null;
  locationError: string | null;
  activeFloor: number;
  savedViewport: SavedViewport | null;
  activeRoute: RouteInfo | null;
  selectedBuilding: SelectedBuilding | null;

  setLevel: (level: MapLevel) => void;
  setDestination: (dest: Destination | null) => void;
  setActiveBuilding: (buildingId: string | null) => void;
  setOutdoorRoute: (route: OutdoorRouteFeature | null) => void;
  setIndoorRoute: (route: RoomNode[] | null) => void;
  triggerTransition: (direction: TransitionDirection) => void;
  setUserLocation: (coords: [number, number]) => void;
  setLocationError: (error: string | null) => void;
  setActiveFloor: (floor: number) => void;
  setSavedViewport: (viewport: SavedViewport | null) => void;
  setActiveRoute: (route: RouteInfo | null) => void;
  setSelectedBuilding: (building: SelectedBuilding | null) => void;
  resetMap: () => void;
  /** Convenience: begin entering a building (state-only, no map animation) */
  enterBuilding: (buildingId: string) => void;
  /** Convenience: fully exit to outdoor (state-only, no map animation) */
  exitBuilding: () => void;
}
