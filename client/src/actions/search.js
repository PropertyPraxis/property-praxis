import { triggerFetchError } from "./redirect";
import {
  APIQueryStringFromSearchParams,
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

/* General action to set search state
use this sparingly as the action
type is not explicit */
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
    try {
      const json = await APIQueryStringFromSearchParams(
        { searchType, searchTerm, searchCoordinates, searchYear },
        route
      );
      const flattendResults = flattenPrimaryResults(json);
      dispatch(updatePrimarySearch({ results: flattendResults }));
      return flattendResults;
    } catch (err) {
      dispatch(triggerFetchError(true));
      console.error(`An error occured for primary search query: ${err}`);
    }
  };
}

export function handlePrimarySearchAll({ searchTerm, searchYear }, route) {
  return async (dispatch) => {
    try {
      const types = ["address", "speculator", "zipcode"];

      const [
        partialAddressResults,
        partialSpeculatorResults,
        partialZipcodeResults,
      ] = await Promise.all(
        types.map(async (searchType, index) => {
          return await APIQueryStringFromSearchParams(
            { searchType, searchTerm, searchYear },
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
    } catch (err) {
      dispatch(triggerFetchError(true));
      console.error(
        `An error occured searching all primaries. Message: ${err}`
      );
    }
  };
}

export function handleDetailedSearchQuery(
  { searchType, searchTerm, searchYear, searchCoordinates = null },
  route
) {
  return async (dispatch) => {
    try {
      const json = await APIQueryStringFromSearchParams(
        { searchType, searchTerm, searchCoordinates, searchYear },
        route
      );
      dispatch(updateDetailedSearch({ results: json }));
      return json;
    } catch (err) {
      dispatch(triggerFetchError(true));
      console.error(`An error occured for detailed search. Message: ${err}`);
    }
  };
}

export function handleSearchBarYearsAction(route) {
  return async (dispatch) => {
    try {
      const json = await APISearchQueryFromRoute(route);
      dispatch(updateSearchBar({ searchYears: json }));
      return json;
    } catch (err) {
      dispatch(triggerFetchError(true));
      console.error(
        `An error occured searching search bar years.  Message: ${err}`
      );
    }
  };
}

export function handleGetPraxisYearsAction(route) {
  return async (dispatch) => {
    try {
      dispatch(updateDetailedSearch({ recordYears: null }));
      const json = await APISearchQueryFromRoute(route);
      dispatch(updateDetailedSearch({ recordYears: json }));
      return json;
    } catch (err) {
      dispatch(triggerFetchError(true));
      console.error(
        `An error occured searching search bar years.  Message: ${err}`
      );
    }
  };
}

export function handleGetViewerImage(longitude, latitude) {
  return async (dispatch) => {
    try {
      const viewer = await getImageKey(longitude, latitude);
      dispatch(
        getViewerImage({
          bearing: null,
          key: null,
          viewerMarker: null,
        })
      );
      dispatch(getViewerImage(viewer));
      return viewer;
    } catch (err) {
      // viewer image ui error
      // dispatch something here for error
      console.error(`An error occured fetching viewer image. Message: ${err}`);
    }
  };
}
