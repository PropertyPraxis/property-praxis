import {
  APISearchQueryFromParams,
  APISearchQueryFromRoute,
} from "../utils/api";
import { getImageKey } from "../utils/viewer";
import { flattenPrimaryResults } from "../utils/helper";

export const UPDATE_GENERAL_SEARCH = "UPDATE_GENERAL_SEARCH"; // general shortcut
export const UPDATE_SEARCH_PARAMS = "UPDATE_SEARCH_PARAMS";
export const UPDATE_PRIMARY_SEARCH = "UPDATE_PRIMARY_SEARCH";
export const UPDATE_DETAILED_SEARCH = "UPDATE_DETAILED_SEARCH";
export const UPDATE_SEARCH_BAR = "UPDATE_SEARCH_BAR";
export const UPDATE_VIEWER_IMAGE = "UPDATE_VIEWER_IMAGE";
export const GET_DOWNLOAD_DATA = "GET_DOWNLOAD_DATA";

// General action to set search state
export function updateGeneralSearch(searchState) {
  return {
    type: UPDATE_GENERAL_SEARCH,
    payload: { ...searchState },
  };
}
export function updateSearchParams(searchParams) {
  return {
    type: UPDATE_SEARCH_PARAMS,
    payload: { ...searchParams },
  };
}
export function updatePrimarySearch(primarySearch) {
  return {
    type: UPDATE_PRIMARY_SEARCH,
    payload: { ...primarySearch },
  };
}
export function updateDetailedSearch(detailedSearch) {
  return {
    type: UPDATE_DETAILED_SEARCH,
    payload: { ...detailedSearch },
  };
}

function updateSearchBar(searchBar) {
  return {
    type: UPDATE_SEARCH_BAR,
    payload: { ...searchBar },
  };
}

function getViewerImage(viewer) {
  return {
    type: UPDATE_VIEWER_IMAGE,
    payload: { viewer },
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
        dispatch(updatePrimarySearch({ results: flattendResults }));
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

    dispatch(updatePrimarySearch({ results: flattendResults }));
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
        dispatch(updateDetailedSearch({ results: json }));
        return json;
      })
      .catch((err) => {
        //need to add some more error hadling
        throw Error(`An error occured searching: ${err}`);
      });
  };
}

export function handleSearchBarYearsAction(route) {
  return (dispatch) => {
    return APISearchQueryFromRoute(route)
      .then((json) => {
        dispatch(updateSearchBar({ searchYears: json }));
        return json;
      })
      .catch((err) => {
        throw Error(`An error occured searching search years: ${err}`);
      });
  };
}

export function handleGetPraxisYearsAction(route) {
  return (dispatch) => {
    return APISearchQueryFromRoute(route)
      .then((json) => {
        dispatch(updateDetailedSearch({ recordYears: json }));
        return json;
      })
      .catch((err) => {
        throw Error(`An error occured searching praxis years: ${err}`);
      });
  };
}

export function handleGetViewerImage(longitude, latitude) {
  return (dispatch) => {
    return getImageKey(longitude, latitude)
      .then((viewer) => {
        dispatch(
          getViewerImage({
            bearing: null,
            key: null,
            viewerMarker: null,
          })
        );
        dispatch(getViewerImage(viewer));
        return viewer;
      })
      .catch((err) => {
        throw Error(`An error occured searching: ${err}`);
      });
  };
}

// export const PRIMARY_SEARCH_QUERY = "PRIMARY_SEARCH_QUERY";
// export const TOGGLE_DETAILED_RESULTS = "TOGGLE_DETAILED_RESULTS";
// export const UPDATE_DETAILED_RESULTS = "UPDATE_DETAILED_RESULTS";
// export const TOGGLE_PRIMARY_RESULTS = "TOGGLE_PRIMARY_RESULTS";
// export const UPDATE_PRIMARY_RESULTS = "UPDATE_PRIMARY_RESULTS";
// export const TOGGLE_PRIMARY_ACTIVE = "TOGGLE_PRIMARY_ACTIVE";
// export const UPDATE_PRIMARY_INDEX = "UPDATE_PRIMARY_INDEX";
// export const GET_SEARCH_YEARS = "GET_SEARCH_YEARS";
// export const GET_PRAXIS_SEARCH_YEARS = "GET_PRAXIS_SEARCH_YEARS"; // should be DB Years

//////////////////////////////////////////////////////////
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

// export function togglePrimaryResultsAction(isOpen) {
//   return {
//     type: TOGGLE_PRIMARY_RESULTS,
//     payload: { isPrimaryResultsOpen: isOpen },
//   };
// }

// export function togglePrimaryActiveAction(isActive) {
//   return {
//     type: TOGGLE_PRIMARY_ACTIVE,
//     payload: { isPrimaryResultsActive: isActive },
//   };
// }

// export function toggleDetailedResultsAction(isOpen) {
//   return {
//     type: TOGGLE_DETAILED_RESULTS,
//     payload: { isDetailedResultsOpen: isOpen },
//   };
// }

// function primarySearchQuery(primaryResults) {
//   return {
//     type: PRIMARY_SEARCH_QUERY,
//     payload: {
//       primaryResults,
//     },
//   };
// }

// export function updatePrimaryIndex(primaryIndex) {
//   return {
//     type: UPDATE_PRIMARY_INDEX,
//     payload: {
//       primaryIndex,
//     },
//   };
// }

// export function updatePrimaryResults(primaryResults) {
//   return {
//     type: UPDATE_PRIMARY_RESULTS,
//     payload: {
//       primaryResults,
//     },
//   };
// }

// export function updateDetailedResults(detailedResults) {
//   return {
//     type: UPDATE_DETAILED_RESULTS,
//     payload: {
//       detailedResults,
//     },
//   };
// }

// function getYearsAction(searchBar) {
//   return {
//     type: GET_SEARCH_YEARS,
//     payload: { searchBar },
//   };
// }

// function getPraxisYearsAction(praxisSearchYears) {
//   return {
//     type: GET_SEARCH_YEARS,
//     payload: { praxisSearchYears },
//   };
// }
