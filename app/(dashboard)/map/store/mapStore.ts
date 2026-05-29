import { create } from "zustand";
import type {
  MapStore,
  MapLevel,
  TransitionDirection,
  Destination,
  RoomNode,
  SavedViewport,
  OutdoorRouteFeature,
  RouteInfo,
  SelectedBuilding,
} from "../types/map.types";

const initialState = {
  level: "outdoor" as MapLevel,
  activeBuilding: null,
  destination: null,
  outdoorRoute: null as OutdoorRouteFeature | null,
  indoorRoute: null,
  transitionDirection: null as TransitionDirection,
  userLocation: null,
  locationError: null as string | null,
  activeFloor: 0,
  savedViewport: null,
  activeRoute: null as RouteInfo | null,
  selectedBuilding: null as SelectedBuilding | null,
};

export const useMapStore = create<MapStore>((set) => ({
  ...initialState,

  setLevel: (level) => set({ level }),

  setDestination: (destination) => set({ destination }),

  setActiveBuilding: (activeBuilding) => set({ activeBuilding }),

  setOutdoorRoute: (outdoorRoute: OutdoorRouteFeature | null) =>
    set({ outdoorRoute }),

  setIndoorRoute: (indoorRoute: RoomNode[] | null) => set({ indoorRoute }),

  triggerTransition: (transitionDirection) => set({ transitionDirection }),

  setUserLocation: (userLocation) => set({ userLocation }),

  setLocationError: (locationError) => set({ locationError }),

  setActiveFloor: (activeFloor) => set({ activeFloor }),

  setSavedViewport: (savedViewport: SavedViewport | null) =>
    set({ savedViewport }),

  setActiveRoute: (activeRoute: RouteInfo | null) => set({ activeRoute }),

  setSelectedBuilding: (selectedBuilding: SelectedBuilding | null) =>
    set({ selectedBuilding }),

  resetMap: () => set(initialState),

  enterBuilding: (buildingId) =>
    set({ level: "transitioning", activeBuilding: buildingId }),

  exitBuilding: () =>
    set({
      level: "outdoor",
      activeBuilding: null,
      destination: null,
      activeFloor: 0,
      transitionDirection: null,
    }),
}));
