import type { FeatureCollection } from "geojson";

/**
 * Real ENSIAS campus GeoJSON — all building polygons surveyed on-site.
 * The "campus-ensias" feature is the outer boundary; every other feature
 * carries  type: "building"  so BuildingPolygons can filter it correctly.
 */
const campusGeoJson: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    // -- Campus boundary ----------------------------------------------
    {
      type: "Feature",
      properties: {
        id: "campus-ensias",
        name: "Campus ENSIAS",
        type: "campus",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8677099, 33.9827572],
            [-6.865866, 33.9845948],
            [-6.8674952, 33.9856372],
            [-6.8692422, 33.9837189],
            [-6.8677099, 33.9827572],
          ],
        ],
      },
    },
    // -- Buildings ----------------------------------------------------
    {
      type: "Feature",
      properties: {
        id: "batiment-a",
        name: "Bâtiment A",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8677312, 33.9828161],
            [-6.8675709, 33.982956],
            [-6.8681739, 33.9833126],
            [-6.8683047, 33.9831728],
            [-6.8677312, 33.9828161],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "epicerie",
        name: "Épicerie",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.867742, 33.9832917],
            [-6.8678491, 33.9831543],
            [-6.8677188, 33.9830863],
            [-6.8676154, 33.9832214],
            [-6.867742, 33.9832917],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "securite",
        name: "Sécurité",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8675667, 33.9830559],
            [-6.8675183, 33.9830246],
            [-6.8675568, 33.9829874],
            [-6.867601, 33.9830164],
            [-6.8675667, 33.9830559],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "batiment-c",
        name: "Bâtiment C",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8675473, 33.9831911],
            [-6.8674192, 33.9833366],
            [-6.8674622, 33.9833677],
            [-6.8673798, 33.9834611],
            [-6.8672027, 33.9833496],
            [-6.867415, 33.9831114],
            [-6.8674156, 33.9831114],
            [-6.8675473, 33.9831911],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "batiment-b",
        name: "Bâtiment B",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8674706, 33.9835077],
            [-6.8675493, 33.9834191],
            [-6.8676015, 33.9834528],
            [-6.8677183, 33.9833233],
            [-6.8678478, 33.9833956],
            [-6.8676409, 33.9836232],
            [-6.8674706, 33.9835077],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "service-de-scolarite",
        name: "Service de Scolarité",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8681883, 33.9834124],
            [-6.8682685, 33.9833242],
            [-6.8684071, 33.9834182],
            [-6.8683269, 33.9835064],
            [-6.8681883, 33.9834124],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "ancienne-scolarite-1",
        name: "Ancienne Scolarité 1",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.868041, 33.9838722],
            [-6.8681527, 33.983748],
            [-6.868089, 33.9837046],
            [-6.8682665, 33.9835004],
            [-6.8680371, 33.9833592],
            [-6.8679445, 33.9834715],
            [-6.8678759, 33.9835597],
            [-6.8679336, 33.9835944],
            [-6.8678287, 33.9837265],
            [-6.8678747, 33.9837597],
            [-6.867869, 33.9837744],
            [-6.868041, 33.9838722],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "ancienne-scolarite-2",
        name: "Ancienne Scolarité 2",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8680945, 33.9838983],
            [-6.8681918, 33.9839676],
            [-6.8682039, 33.983953],
            [-6.8682468, 33.9839953],
            [-6.8683353, 33.9839092],
            [-6.8683373, 33.9839106],
            [-6.8685705, 33.9836876],
            [-6.8683961, 33.9835741],
            [-6.8680945, 33.9838983],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "buvette-des-professeurs",
        name: "Buvette des Professeurs",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8684078, 33.9839827],
            [-6.8684763, 33.9839279],
            [-6.8684279, 33.9838831],
            [-6.8683579, 33.9839371],
            [-6.8684078, 33.9839827],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "grand-amphi",
        name: "Grand Amphi",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.867792, 33.9839714],
            [-6.8675851, 33.9837947],
            [-6.8677197, 33.9836957],
            [-6.8679146, 33.9838783],
            [-6.867792, 33.9839714],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "administration",
        name: "Administration",
        type: "building",
        hasIndoorMap: true,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8678571, 33.9843329],
            [-6.8679061, 33.9842831],
            [-6.8679683, 33.9842147],
            [-6.8677306, 33.9840586],
            [-6.8676194, 33.9841718],
            [-6.8678571, 33.9843329],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "securite-2",
        name: "Sécurité 2",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8689542, 33.983968],
            [-6.868731, 33.9838411],
            [-6.8688225, 33.983736],
            [-6.8690267, 33.9838636],
            [-6.8689542, 33.983968],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "securite-3",
        name: "Sécurité 3",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8682935, 33.9847368],
            [-6.8682578, 33.984778],
            [-6.8681434, 33.9847025],
            [-6.8681815, 33.984664],
            [-6.8682935, 33.9847368],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "parking-administration",
        name: "Parking Administration",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8681463, 33.984631],
            [-6.8678062, 33.984419],
            [-6.8676751, 33.9845425],
            [-6.8680441, 33.9847507],
            [-6.8681463, 33.984631],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "terrain-de-sport",
        name: "Terrain de Sport",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8674867, 33.9836502],
            [-6.8673419, 33.9838003],
            [-6.8672052, 33.9837148],
            [-6.8671362, 33.9837795],
            [-6.8672699, 33.9838697],
            [-6.8670232, 33.9841437],
            [-6.8666741, 33.9839207],
            [-6.8671662, 33.98342],
            [-6.8674867, 33.9836502],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "terrain-de-volley",
        name: "Terrain de Volley",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.867469, 33.983649],
            [-6.8671686, 33.9834302],
            [-6.8670161, 33.983587],
            [-6.8673355, 33.9837873],
            [-6.867469, 33.983649],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "terrain-de-basket",
        name: "Terrain de Basket",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8672524, 33.9838693],
            [-6.8671475, 33.9839827],
            [-6.8668281, 33.9837877],
            [-6.8669473, 33.9836704],
            [-6.8672524, 33.9838693],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "terrain-de-football",
        name: "Terrain de Football",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8671337, 33.983988],
            [-6.8670129, 33.9841211],
            [-6.8666983, 33.9839181],
            [-6.8668191, 33.9837956],
            [-6.8671337, 33.983988],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "parking-public",
        name: "Parking Public",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8675708, 33.9839818],
            [-6.867393, 33.9838663],
            [-6.8671663, 33.9841108],
            [-6.8673463, 33.9842214],
            [-6.8675708, 33.9839818],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "batiment-d",
        name: "Bâtiment D",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.866891, 33.9842108],
            [-6.8667984, 33.9841494],
            [-6.8666846, 33.9842689],
            [-6.8667868, 33.9843386],
            [-6.8666681, 33.9844758],
            [-6.8663942, 33.98429],
            [-6.8666847, 33.9839855],
            [-6.8669547, 33.9841438],
            [-6.866891, 33.9842108],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "salle-de-priere",
        name: "Salle de Prière",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.866953, 33.984143],
            [-6.8669091, 33.9841175],
            [-6.8668495, 33.9841838],
            [-6.8668914, 33.9842109],
            [-6.866953, 33.984143],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "salle-ablution",
        name: "Salle d'Ablution",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8668482, 33.9841816],
            [-6.8668017, 33.9841501],
            [-6.8668554, 33.984086],
            [-6.8669078, 33.984117],
            [-6.8668482, 33.9841816],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "buanderie",
        name: "Buanderie",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8667974, 33.9841487],
            [-6.8667486, 33.9841182],
            [-6.8667031, 33.9841679],
            [-6.8667515, 33.9841972],
            [-6.8667974, 33.9841487],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "bureaux-des-professeurs",
        name: "Bureaux des Professeurs",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8673177, 33.9843179],
            [-6.8672808, 33.9843663],
            [-6.867163, 33.9842967],
            [-6.8671121, 33.984366],
            [-6.8672296, 33.9844301],
            [-6.8671931, 33.9844723],
            [-6.8669948, 33.9843569],
            [-6.867123, 33.9842019],
            [-6.8673177, 33.9843179],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "salle-de-tp",
        name: "Salle de TP",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8672657, 33.9846157],
            [-6.8673271, 33.9845432],
            [-6.8674176, 33.9845999],
            [-6.8674953, 33.9845118],
            [-6.8674133, 33.9844639],
            [-6.8674696, 33.9843977],
            [-6.8676406, 33.9845041],
            [-6.8674457, 33.9847246],
            [-6.8672657, 33.9846157],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "amphi-1",
        name: "Amphi 1",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8672555, 33.9848489],
            [-6.8673264, 33.9847481],
            [-6.8671553, 33.9846736],
            [-6.8671083, 33.9847485],
            [-6.8671707, 33.984782],
            [-6.8671546, 33.9848029],
            [-6.8671617, 33.984808],
            [-6.8672555, 33.9848489],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "toilette",
        name: "Toilette",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8673172, 33.9847304],
            [-6.8672695, 33.9847033],
            [-6.8673121, 33.9846518],
            [-6.8673626, 33.9846815],
            [-6.8673172, 33.9847304],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "amphi-2",
        name: "Amphi 2",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8670141, 33.9846794],
            [-6.8668584, 33.9846075],
            [-6.8669353, 33.9845008],
            [-6.8670202, 33.9845449],
            [-6.8670063, 33.9845723],
            [-6.8670696, 33.9846062],
            [-6.8670141, 33.9846794],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "toilette-2",
        name: "Toilette 2",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8670503, 33.9845434],
            [-6.8670751, 33.9844952],
            [-6.8671337, 33.9845182],
            [-6.8671689, 33.9844604],
            [-6.8670515, 33.9844102],
            [-6.866992, 33.9845216],
            [-6.8670503, 33.9845434],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "terrain-gazon",
        name: "Terrain Gazon",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8675233, 33.9854432],
            [-6.8671135, 33.9851725],
            [-6.8676526, 33.9845859],
            [-6.8680667, 33.9848486],
            [-6.8675233, 33.9854432],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "agora",
        name: "Agora",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.866518, 33.9849972],
            [-6.8669023, 33.9852358],
            [-6.8672228, 33.9848774],
            [-6.8668038, 33.9846112],
            [-6.866518, 33.9849972],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "salle-de-td-1",
        name: "Salle de TD",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.86705, 33.9850172],
            [-6.8669588, 33.9849586],
            [-6.8670987, 33.9848112],
            [-6.8671899, 33.9848777],
            [-6.86705, 33.9850172],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "salle-de-td-2",
        name: "Salle de TD 2",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8669037, 33.98469],
            [-6.8668015, 33.9848517],
            [-6.8666946, 33.9848099],
            [-6.8668062, 33.984643],
            [-6.8669037, 33.98469],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "amphi-3",
        name: "Amphi 3",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8670035, 33.985074],
            [-6.8668695, 33.9849805],
            [-6.8667418, 33.9851124],
            [-6.8668817, 33.9852053],
            [-6.8670035, 33.985074],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "amphi-4",
        name: "Amphi 4",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8667943, 33.9849384],
            [-6.8666841, 33.9850776],
            [-6.8665407, 33.9849964],
            [-6.8666299, 33.9848601],
            [-6.8667943, 33.9849384],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "batiment-e",
        name: "Bâtiment E",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8666492, 33.9845264],
            [-6.866547, 33.9846192],
            [-6.8664407, 33.9845523],
            [-6.8663288, 33.9846616],
            [-6.8664387, 33.9847365],
            [-6.8663197, 33.9848514],
            [-6.8660278, 33.9846439],
            [-6.8663498, 33.9843288],
            [-6.8666492, 33.9845264],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "foyer",
        name: "Foyer",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8666403, 33.9845267],
            [-6.8665473, 33.9846099],
            [-6.8662519, 33.9844287],
            [-6.8663516, 33.9843381],
            [-6.8666403, 33.9845267],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "buvette",
        name: "Buvette",
        type: "building",
        hasIndoorMap: false,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.8664326, 33.9845481],
            [-6.8663527, 33.9845002],
            [-6.866253, 33.9846093],
            [-6.8663231, 33.9846603],
            [-6.8664326, 33.9845481],
          ],
        ],
      },
    },
  ],
};

export default campusGeoJson;
