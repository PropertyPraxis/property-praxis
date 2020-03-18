import { TOGGLE_RESULTS, GET_VIEWER_IMAGE } from "../actions/results";

const initialResults = {
  isOpen: false,
  viewer: {
    bearing: null,
    key: null,
    viewerMarker: null
  }
};

export default function results(state = initialResults, action) {
  switch (action.type) {
    case TOGGLE_RESULTS:
      return { ...state, ...action.payload };
    case GET_VIEWER_IMAGE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
