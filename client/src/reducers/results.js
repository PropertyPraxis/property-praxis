import {
  TOGGLE_FULL_RESULTS,
  GET_VIEWER_IMAGE,
  TOGGLE_PARTIAL_RESULTS
} from "../actions/results";

const initialResults = {
  isFullResultsOpen: false,
  viewer: {
    bearing: null,
    key: null,
    viewerMarker: null
  },
  isPartialResultsOpen: true
};

export default function results(state = initialResults, action) {
  switch (action.type) {
    case TOGGLE_FULL_RESULTS:
      return { ...state, ...action.payload };
    case GET_VIEWER_IMAGE:
      return { ...state, ...action.payload };
    case TOGGLE_PARTIAL_RESULTS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
