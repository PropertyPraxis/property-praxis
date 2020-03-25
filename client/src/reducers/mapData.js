import {
  GET_INITIAL_MAP_DATA,
  GET_INITIAL_ZIPCODE_DATA,
  GET_PARCELS_BY_QUERY,
  GET_YEAR,
  LOG_MARKER_DRAG,
  MARKER_DRAG_END,
  SET_MARKER_COORDS,
  DATA_IS_LOADING
} from "../actions/mapData";

const intialMapData = {
  ppraxis: {},
  zips: {},
  year: "2017",
  events: {},
  marker: { longitude: null, latitude: null },
  dataIsLoading: true
};

export default function mapData(state = intialMapData, action) {
  switch (action.type) {
    case GET_INITIAL_MAP_DATA:
      return { ...state, ...action.payload };
    case GET_INITIAL_ZIPCODE_DATA:
      return { ...state, ...action.payload };
    case GET_PARCELS_BY_QUERY:
      return { ...state, ...action.payload };
    case GET_YEAR:
      return { ...state, ...action.payload };
    case LOG_MARKER_DRAG:
      return { ...state, ...action.payload };
    case MARKER_DRAG_END:
      return { ...state, ...action.payload };
    case SET_MARKER_COORDS:
      return { ...state, ...action.payload };
    case DATA_IS_LOADING:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// GET_PARCELS_BY_ZIPCODE,
// GET_PARCELS_BY_SPECULATOR,
// case GET_PARCELS_BY_ZIPCODE:
//   return { ...state, ...action.payload };
// case GET_PARCELS_BY_SPECULATOR:
//   return { ...state, ...action.payload };
