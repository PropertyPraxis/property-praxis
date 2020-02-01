import { GET_MAP_STATE } from "../actions/mapState";

const initialViewport = {
  latitude: 42.40230199308517,
  longitude: -83.11182404081912,
  zoom: 8,
  bearing: 0,
  pitch: 0
};

export default function mapState(state = initialViewport, action) {
  switch (action.type) {
    case GET_MAP_STATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
