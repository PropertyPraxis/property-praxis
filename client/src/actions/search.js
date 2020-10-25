import {
  APISearchQueryFromParams,
  APISearchQueryFromRoute,
} from "../utils/api";
import { getImageKey } from "../utils/viewer";
import { flattenPrimaryResults } from "../utils/helper";

export const RESET_SEARCH = "RESET_SEARCH";
export const PRIMARY_SEARCH_QUERY = "PRIMARY_SEARCH_QUERY";
export const UPDATE_DETAILED_RESULTS = "UPDATE_DETAILED_RESULTS";
export const UPDATE_PRIMARY_INDEX = "UPDATE_PRIMARY_INDEX";
export const GET_SEARCH_YEARS = "GET_SEARCH_YEARS";
export const GET_VIEWER_IMAGE = "GET_VIEWER_IMAGE";
// export const GET_DOWNLOAD_DATA = "GET_DOWNLOAD_DATA";
export const TOGGLE_DETAILED_RESULTS = "TOGGLE_DETAILED_RESULTS";

export function resetSearch(searchState) {
  return {
    type: RESET_SEARCH,
    payload: { ...searchState },
  };
}

function primarySearchQuery(primaryResults) {
  return {
    type: PRIMARY_SEARCH_QUERY,
    payload: {
      primaryResults,
    },
  };
}

export function updatePrimaryIndex(primaryIndex) {
  return {
    type: UPDATE_PRIMARY_INDEX,
    payload: {
      primaryIndex,
    },
  };
}

export function updateDetailedResults(detailedResults) {
  return {
    type: UPDATE_DETAILED_RESULTS,
    payload: {
      detailedResults,
    },
  };
}

function getYearsAction(searchYears) {
  return {
    type: GET_SEARCH_YEARS,
    payload: { searchYears },
  };
}

function getViewerImageAction(viewer) {
  return {
    type: GET_VIEWER_IMAGE,
    payload: { viewer },
  };
}

export function toggleDetailedResultsAction(isOpen) {
  return {
    type: TOGGLE_DETAILED_RESULTS,
    payload: { isDetailedResultsOpen: isOpen },
  };
}

export function handlePrimarySearchQuery(
  { searchType, searchTerm, searchCoordinates, searchYear },
  route
) {
  return async (dispatch) => {
    return APISearchQueryFromParams(
      { searchType, searchTerm, searchCoordinates, searchYear },
      route
    )
      .then((json) => {
        const flattendResults = flattenPrimaryResults(json);
        dispatch(primarySearchQuery(flattendResults));
        return flattendResults;
      })
      .catch((err) => {
        //need to add some more error hadling
        throw Error(`An error occured searching: ${err}`);
      });
  };
}

export function handlePrimarySearchAll({ searchTerm, searchYear }, routes) {
  return async (dispatch) => {
    const types = ["address", "speculator", "zipcode"];

    const [
      partialAddressResults,
      partialSpeculatorResults,
      partialZipcodeResults,
    ] = await Promise.all(
      routes.map(async (route, index) => {
        return await APISearchQueryFromParams(
          { searchType: types[index], searchTerm, searchYear },
          route
        );
      })
    );
    const flattendResults = flattenPrimaryResults([
      partialAddressResults,
      partialSpeculatorResults,
      partialZipcodeResults,
    ]);

    dispatch(primarySearchQuery(flattendResults));
  };
}

export function handleDetailedSearchQuery(
  { searchType, searchTerm, searchYear, searchCoordinates = null },
  route
) {
  return async (dispatch) => {
    return APISearchQueryFromParams(
      { searchType, searchTerm, searchCoordinates, searchYear },
      route
    )
      .then((json) => {
        dispatch(updateDetailedResults(json));
        return json;
      })
      .catch((err) => {
        //need to add some more error hadling
        throw Error(`An error occured searching: ${err}`);
      });
  };
}

export function handleGetYearsAction(route) {
  return (dispatch) => {
    return APISearchQueryFromRoute(route)
      .then((json) => {
        dispatch(getYearsAction(json));
        return json;
      })
      .catch((err) => {
        throw Error(`An error occured searching: ${err}`);
      });
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

// export function handleGetDownloadDataAction(route) {
//   return (dispatch) => {
//     dispatch(getDownloadDataAction(null));
//     return getDownloadData(route)
//       .then((data) => {
//         dispatch(getDownloadDataAction(data));
//         return data;
//       })
//       .catch((err) => {
//         throw Error(`An error occured searching: ${err}`);
//       });
//   };
// }

// function getDownloadDataAction(downloadData) {
//   return {
//     type: GET_DOWNLOAD_DATA,
//     payload: { downloadData },
//   };
// }
