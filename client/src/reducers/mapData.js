import {
  GET_INITIAL_MAP_DATA,
  GET_INITIAL_ZIPCODE_DATA,
  GET_YEAR
} from "../actions/mapData";

const intialMapData = {
  ppraxis: {},
  zips: {},
  year: "2017"
};

export default function mapData(state = intialMapData, action) {
  switch (action.type) {
    case GET_INITIAL_MAP_DATA:
      return { ...state, ...action.payload };
    case GET_INITIAL_ZIPCODE_DATA:
      return { ...state, ...action.payload };
    case GET_YEAR:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
