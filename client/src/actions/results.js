import { getImageKey } from "../utils/viewer";

export const TOGGLE_RESULTS = "TOGGLE_RESULTS";
export const GET_VIEWER_IMAGE = "GET_VIEWER_IMAGE";

export function toggleResultsAction(isOpen) {
  return {
    type: TOGGLE_RESULTS,
    payload: { isOpen }
  };
}

function getViewerImageAction(viewer) {
  return {
    type: GET_VIEWER_IMAGE,
    payload: { viewer }
  };
}

export function handleGetViewerImageAction(longitude, latitude) {
  return dispatch => {
    return getImageKey(longitude, latitude)
      .then(viewer => {
        dispatch(
          getViewerImageAction({
            bearing: null,
            key: null,
            viewerMarker: null
          })
        );
        dispatch(getViewerImageAction(viewer));
        return viewer;
      })
      .catch(err => {
        throw Error(`An error occured searching: ${err}`);
      });
  };
}
