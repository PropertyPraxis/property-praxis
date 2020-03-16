//this is where specific mapstyles will go for layers.
const stops = [
  [20, "#3288bd"],
  [100, "#99d594"],
  [200, "#e6f598"],
  [500, "#ffffbf"],
  [1000, "#fee08b"],
  [1500, "#fc8d59"],
  [2000, "#d53e4f"]
];

export const parcelLayer = {
  id: "parcel-polygon",
  type: "fill",
  minzoom: 13,
  // maxzoom: 16,
  buffer: 0,
  tolerance: 0.9,
  paint: {
    "fill-color": {
      property: "count",
      stops
    },
    "fill-opacity": 1,
    "fill-outline-color": "rgba(255,255,255,1)"
  }
};

export const parcelHighlightLayer = {
  id: "highlight-parcel-polygon",
  type: "fill",
  source: "parcel-polygon",
  minzoom: 13,
  // maxzoom: 16,
  buffer: 0,
  tolerance: 0.9,
  paint: {
    "fill-color": "rgba(0,0,0,0.4)",
    "fill-opacity": 1,
    "fill-outline-color": "rgba(0,0,0,1)"
  }
};

export const parcelCentroid = {
  id: "parcel-centroid",
  type: "circle",
  maxzoom: 13,
  buffer: 0,
  tolerance: 0.9,
  paint: {
    "circle-radius": 3,
    "circle-color": {
      property: "count",
      stops
    }
  }
};

export const zipsLayer = {
  id: "zips",
  type: "line",
  maxzoom: 13,
  paint: {
    "line-width": 3,
    "line-dasharray": [3, 3],
    "line-color": "red"
  }
};

export const zipsLabel = {
  id: "zips-label",
  type: "symbol",
  maxzoom: 13,
  layout: {
    "text-field": ["get", "zipcode"],
    "text-anchor": "center",
    "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],

    "text-justify": "auto"
  },
  paint: {
    "text-halo-color": "white",
    "text-halo-width": 1
  }
};

///TESTIG BELOW
//Heat map styles
const MAX_ZOOM_LEVEL = 19;

export const heatmapLayer = {
  maxzoom: MAX_ZOOM_LEVEL,
  type: "heatmap",
  paint: {
    // Increase the heatmap weight based on frequency and property magnitude
    "heatmap-weight": ["interpolate", ["linear"], ["get", "count"], 0, 0, 6, 1],
    // Increase the heatmap color weight weight by zoom level
    // heatmap-intensity is a multiplier on top of heatmap-weight
    "heatmap-intensity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      0,
      1,
      MAX_ZOOM_LEVEL,
      3
    ],
    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
    // Begin color ramp at 0-stop with a 0-transparancy color
    // to create a blur-like effect.
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      "rgba(33,102,172,0)",
      0.2,
      "rgb(103,169,207)",
      0.4,
      "rgb(209,229,240)",
      0.6,
      "rgb(253,219,199)",
      0.8,
      "rgb(239,138,98)",
      0.9,
      "rgb(255,201,101)"
    ],
    // Adjust the heatmap radius by zoom level
    "heatmap-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      0,
      2,
      MAX_ZOOM_LEVEL,
      20
    ],
    // Transition from heatmap to circle layer by zoom level
    "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 1, 19, 0]
  }
};

//TEST STYLES BELOW
// For more information on data-driven styles, see https://www.mapbox.com/help/gl-dds-ref/
// export const parcelLayer = {
//     id: 'data',
//     type: 'fill',
//     paint: {
//       'fill-color': {
//         property: 'percentile',
//         stops: [
//           [0, '#3288bd'],
//           [1, '#66c2a5'],
//           [2, '#abdda4'],
//           [3, '#e6f598'],
//           [4, '#ffffbf'],
//           [5, '#fee08b'],
//           [6, '#fdae61'],
//           [7, '#f46d43'],
//           [8, '#d53e4f']
//         ]
//       },
//       'fill-opacity': 0.8
//     }
//   }

//cluster styles
// export const clusterLayer = {
//   id: "clusters",
//   type: "circle",
//   source: "parcel-centroid",
//   //   source: "earthquakes",
//   filter: ["has", "point_count"],
//   paint: {
//     "circle-color": [
//       "step",
//       ["get", "point_count"],
//       "#51bbd6",
//       100,
//       "#f1f075",
//       750,
//       "#f28cb1"
//     ],
//     "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40]
//   }
// };

// export const clusterCountLayer = {
//   id: "cluster-count",
//   type: "symbol",
//   source: "parcel-centroid",
//   //   source: "earthquakes",
//   filter: ["has", "point_count"],
//   layout: {
//     "text-field": "{point_count_abbreviated}",
//     "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
//     "text-size": 12
//   }
// };

// export const unclusteredPointLayer = {
//   id: "unclustered-point",
//   type: "circle",
//   source: "parcel-centroid",
//   //   source: "earthquakes",
//   filter: ["!", ["has", "point_count"]],
//   paint: {
//     "circle-color": "#11b4da",
//     "circle-radius": 4,
//     "circle-stroke-width": 1,
//     "circle-stroke-color": "#fff"
//   }
// };
