/**
 * Reseau de chemins pietons du campus ENSIAS.
 *
 * Convention de nommage :
 *   w-entree-*   noeud a l'entree d'un batiment
 *   w-allee-*    noeud sur une allee principale
 *   w-carref-*   carrefour / intersection
 *
 * Coordonnees : [longitude, latitude] (ordre Mapbox).
 * Ajuster en zoomant sur la carte avec GraphEditor (dev only).
 */
export interface WaypointNode {
  id: string;
  coords: [number, number];
  connectedTo: string[];
}

// ── Reseau de noeuds ─────────────────────────────────────────────

export const CAMPUS_WAYPOINTS: WaypointNode[] = [

  // ── CARREFOURS PRINCIPAUX ─────────────────────────────────────
  {
    id: "w-carref-centre",
    coords: [-6.8673, 33.9840],
    connectedTo: [
      "w-carref-nord", "w-carref-sud",
      "w-carref-est",  "w-carref-ouest",
    ],
  },
  {
    id: "w-carref-nord",
    coords: [-6.8673, 33.9847],
    connectedTo: [
      "w-carref-centre",
      "w-entree-salle-tp", "w-entree-amphi-1",
      "w-entree-administration",
    ],
  },
  {
    id: "w-carref-sud",
    coords: [-6.8673, 33.9833],
    connectedTo: [
      "w-carref-centre",
      "w-entree-batiment-a", "w-entree-batiment-b",
      "w-entree-epicerie",
    ],
  },
  {
    id: "w-carref-est",
    coords: [-6.8665, 33.9840],
    connectedTo: [
      "w-carref-centre",
      "w-entree-batiment-d", "w-entree-batiment-e",
      "w-entree-foyer", "w-entree-buvette",
    ],
  },
  {
    id: "w-carref-ouest",
    coords: [-6.8683, 33.9840],
    connectedTo: [
      "w-carref-centre",
      "w-entree-service-scolarite",
      "w-entree-ancienne-scolarite-1",
    ],
  },

  // ── ALLEES NORD ───────────────────────────────────────────────
  {
    id: "w-allee-nord-1",
    coords: [-6.8670, 33.9848],
    connectedTo: [
      "w-carref-nord",
      "w-entree-salle-td-1", "w-entree-amphi-3",
    ],
  },
  {
    id: "w-allee-nord-2",
    coords: [-6.8668, 33.9847],
    connectedTo: [
      "w-allee-nord-1",
      "w-entree-salle-td-2", "w-entree-amphi-4",
      "w-entree-agora",
    ],
  },

  // ── ENTREES DES BATIMENTS ─────────────────────────────────────
  {
    id: "w-entree-administration",
    coords: [-6.8678, 33.9843],
    connectedTo: ["w-carref-nord", "w-carref-ouest"],
  },
  {
    id: "w-entree-batiment-a",
    coords: [-6.8679, 33.9830],
    connectedTo: ["w-carref-sud"],
  },
  {
    id: "w-entree-batiment-b",
    coords: [-6.8676, 33.9835],
    connectedTo: ["w-carref-sud", "w-carref-centre"],
  },
  {
    id: "w-entree-batiment-c",
    coords: [-6.8674, 33.9832],
    connectedTo: ["w-carref-sud"],
  },
  {
    id: "w-entree-batiment-d",
    coords: [-6.8667, 33.9842],
    connectedTo: ["w-carref-est"],
  },
  {
    id: "w-entree-batiment-e",
    coords: [-6.8663, 33.9847],
    connectedTo: ["w-carref-est", "w-allee-nord-2"],
  },
  {
    id: "w-entree-grand-amphi",
    coords: [-6.8677, 33.9838],
    connectedTo: ["w-carref-centre", "w-carref-ouest"],
  },
  {
    id: "w-entree-amphi-1",
    coords: [-6.8672, 33.9848],
    connectedTo: ["w-carref-nord"],
  },
  {
    id: "w-entree-amphi-2",
    coords: [-6.8670, 33.9845],
    connectedTo: ["w-carref-nord", "w-carref-centre"],
  },
  {
    id: "w-entree-amphi-3",
    coords: [-6.8669, 33.9850],
    connectedTo: ["w-allee-nord-1"],
  },
  {
    id: "w-entree-amphi-4",
    coords: [-6.8667, 33.9849],
    connectedTo: ["w-allee-nord-2"],
  },
  {
    id: "w-entree-salle-tp",
    coords: [-6.8674, 33.9845],
    connectedTo: ["w-carref-nord"],
  },
  {
    id: "w-entree-salle-td-1",
    coords: [-6.8671, 33.9849],
    connectedTo: ["w-allee-nord-1"],
  },
  {
    id: "w-entree-salle-td-2",
    coords: [-6.8669, 33.9847],
    connectedTo: ["w-allee-nord-2"],
  },
  {
    id: "w-entree-agora",
    coords: [-6.8668, 33.9848],
    connectedTo: ["w-allee-nord-2"],
  },
  {
    id: "w-entree-foyer",
    coords: [-6.8664, 33.9844],
    connectedTo: ["w-carref-est"],
  },
  {
    id: "w-entree-buvette",
    coords: [-6.8663, 33.9846],
    connectedTo: ["w-carref-est"],
  },
  {
    id: "w-entree-epicerie",
    coords: [-6.8677, 33.9832],
    connectedTo: ["w-carref-sud"],
  },
  {
    id: "w-entree-service-scolarite",
    coords: [-6.8683, 33.9835],
    connectedTo: ["w-carref-ouest"],
  },
  {
    id: "w-entree-ancienne-scolarite-1",
    coords: [-6.8680, 33.9837],
    connectedTo: ["w-carref-ouest"],
  },
  {
    id: "w-entree-ancienne-scolarite-2",
    coords: [-6.8683, 33.9839],
    connectedTo: ["w-carref-ouest"],
  },
  {
    id: "w-entree-bureaux-professeurs",
    coords: [-6.8671, 33.9843],
    connectedTo: ["w-carref-centre"],
  },
  {
    id: "w-entree-parking-public",
    coords: [-6.8674, 33.9841],
    connectedTo: ["w-carref-centre"],
  },
  {
    id: "w-entree-parking-administration",
    coords: [-6.8679, 33.9846],
    connectedTo: ["w-carref-nord", "w-entree-administration"],
  },
  {
    id: "w-entree-buvette-professeurs",
    coords: [-6.8684, 33.9839],
    connectedTo: ["w-carref-ouest"],
  },
  {
    id: "w-entree-terrain-sport",
    coords: [-6.8671, 33.9838],
    connectedTo: ["w-carref-centre"],
  },
  {
    id: "w-entree-terrain-gazon",
    coords: [-6.8675, 33.9851],
    connectedTo: ["w-carref-nord"],
  },
  {
    id: "w-entree-securite",
    coords: [-6.8675, 33.9831],
    connectedTo: ["w-carref-sud"],
  },
];

/**
 * Mapping batiment ID -> noeud d'entree correspondant dans le graphe.
 * Si un batiment n'est pas liste ici, le hook utilisera findNearestNode
 * comme fallback automatique.
 */
export const BUILDING_TO_WAYPOINT: Record<string, string> = {
  administration:             "w-entree-administration",
  "batiment-a":               "w-entree-batiment-a",
  "batiment-b":               "w-entree-batiment-b",
  "batiment-c":               "w-entree-batiment-c",
  "batiment-d":               "w-entree-batiment-d",
  "batiment-e":               "w-entree-batiment-e",
  "grand-amphi":              "w-entree-grand-amphi",
  "amphi-1":                  "w-entree-amphi-1",
  "amphi-2":                  "w-entree-amphi-2",
  "amphi-3":                  "w-entree-amphi-3",
  "amphi-4":                  "w-entree-amphi-4",
  "salle-de-tp":              "w-entree-salle-tp",
  "salle-de-td-1":            "w-entree-salle-td-1",
  "salle-de-td-2":            "w-entree-salle-td-2",
  agora:                      "w-entree-agora",
  foyer:                      "w-entree-foyer",
  buvette:                    "w-entree-buvette",
  epicerie:                   "w-entree-epicerie",
  "service-de-scolarite":     "w-entree-service-scolarite",
  "ancienne-scolarite-1":     "w-entree-ancienne-scolarite-1",
  "ancienne-scolarite-2":     "w-entree-ancienne-scolarite-2",
  "bureaux-des-professeurs":  "w-entree-bureaux-professeurs",
  "parking-public":           "w-entree-parking-public",
  "parking-administration":   "w-entree-parking-administration",
  "buvette-des-professeurs":  "w-entree-buvette-professeurs",
  "terrain-de-sport":         "w-entree-terrain-sport",
  "terrain-gazon":            "w-entree-terrain-gazon",
  securite:                   "w-entree-securite",
};
