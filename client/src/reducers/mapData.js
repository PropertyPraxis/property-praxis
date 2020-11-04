import {
  GET_PARCELS_BY_QUERY,
  GET_REVERSE_GEOCODE,
  GET_ZIPCODES,
  LOG_MARKER_DRAG,
  MARKER_DRAG_END,
  SET_MARKER_COORDS,
} from "../actions/mapData";

const intialMapData = {
  ppraxis: null,
  zips: null,
  events: {},
  marker: { longitude: null, latitude: null },
  dataIsLoading: true,
};

export default function mapData(state = intialMapData, action) {
  switch (action.type) {
    case GET_PARCELS_BY_QUERY:
      return { ...state, ...action.payload };
    case GET_REVERSE_GEOCODE:
      return { ...state, ...action.payload };
    case GET_ZIPCODES:
      return { ...state, ...action.payload };
    case LOG_MARKER_DRAG:
      return { ...state, ...action.payload };
    case MARKER_DRAG_END:
      return { ...state, ...action.payload };
    case SET_MARKER_COORDS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
