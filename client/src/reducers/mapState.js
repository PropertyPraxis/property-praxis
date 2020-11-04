import { GET_MAP_STATE, TOGGLE_LOADING_INDICATOR } from "../actions/mapState";

const initialMapState = {
  viewport: {
    latitude: 42.40230199308517,
    longitude: -83.11182404081912,
    zoom: 10,
    bearing: 0,
    pitch: 0,
  },
  loadingIsOpen: false,
};

export default function mapState(state = initialMapState, action) {
  switch (action.type) {
    case GET_MAP_STATE:
      return { ...state, ...action.payload };
    case TOGGLE_LOADING_INDICATOR:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
