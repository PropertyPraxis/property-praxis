import { getImageKey } from "../utils/viewer";
import { getDownloadData } from "../utils/api";
export const TOGGLE_FULL_RESULTS = "TOGGLE_FULL_RESULTS";
export const GET_VIEWER_IMAGE = "GET_VIEWER_IMAGE";
export const TOGGLE_PARTIAL_RESULTS = "TOGGLE_PARTIAL_RESULTS";
export const GET_DOWNLOAD_DATA = "GET_DOWNLOAD_DATA";

export function toggleFullResultsAction(isOpen) {
  return {
    type: TOGGLE_FULL_RESULTS,
    payload: { isFullResultsOpen: isOpen },
  };
}

function getViewerImageAction(viewer) {
  return {
    type: GET_VIEWER_IMAGE,
    payload: { viewer },
  };
}

function getDownloadDataAction(downloadData) {
  return {
    type: GET_DOWNLOAD_DATA,
    payload: { downloadData },
  };
}

export function togglePartialResultsAction(isOpen) {
  return {
    type: TOGGLE_PARTIAL_RESULTS,
    payload: {
      isPartialResultsOpen: isOpen,
    },
  };
}

export function handleGetViewerImageAction(longitude, latitude) {
  return (dispatch) => {
    return getImageKey(longitude, latitude)
      .then((viewer) => {
        dispatch(
          getViewerImageAction({
            bearing: null,
            key: null,
            viewerMarker: null,
          })
        );
        dispatch(getViewerImageAction(viewer));
        return viewer;
      })
      .catch((err) => {
        throw Error(`An error occured searching: ${err}`);
      });
  };
}

export function handleGetDownloadDataAction(route) {
  return (dispatch) => {
    dispatch(getDownloadDataAction(null));
    return getDownloadData(route)
      .then((data) => {
        dispatch(getDownloadDataAction(data));
        return data;
      })
      .catch((err) => {
        throw Error(`An error occured searching: ${err}`);
      });
  };
}
