import { GET_MAP_STATE } from "../actions/mapState";

const initialViewport = {
  latitude: 42.39165336592829,
  longitude: -83.21525729904025,
  zoom: 12,
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
