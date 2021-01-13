import * as styleVars from "../../scss/colors.scss";

//this is where specific mapstyles will go for layers.

const stops = [
  [1, styleVars.parcelStop1],
  [2, styleVars.parcelStop2],
  [3, styleVars.parcelStop3],
  [4, styleVars.parcelStop4],
  [5, styleVars.parcelStop5],
  [6, styleVars.parcelStop6],
  [7, styleVars.parcelStop7],
];

export const parcelLayer = {
  id: "parcel-polygon",
  type: "fill",
  minzoom: 13,
  buffer: 0,
  tolerance: 0.9,
};

export const parcelHighlightLayer = {
  id: "highlight-parcel-polygon",
  type: "fill",
  source: "parcel-polygon",
  // minzoom: 13,
  buffer: 0,
  tolerance: 0.9,
  paint: {
    "fill-color": "rgba(0,0,0,0.4)",
    "fill-opacity": 1,
    "fill-outline-color": "rgba(0,0,0,1)",
  },
};

export const parcelCentroid = {
  id: "parcel-centroid",
  type: "circle",
  maxzoom: 13,
  buffer: 0,
  tolerance: 0.9,
};

// export const parcelCentroidHighlightLayer = {
//   id: "highlight-parcel-centroid",
//   type: "fill",
//   maxzoom: 13,
//   buffer: 0,
//   tolerance: 0.9,
// };

export const zipsLayer = {
  id: "zips",
  type: "line",
  paint: {
    "line-width": 3,
    "line-dasharray": [3, 3],
    "line-color": "red",
  },
};

export const zipsLabel = {
  id: "zips-label",
  type: "symbol",
  layout: {
    "text-field": ["get", "zipcode"],
    "text-anchor": "center",
    "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
    "text-justify": "auto",
  },
  paint: {
    "text-halo-color": "white",
    "text-halo-width": 1,
  },
};
