import { populateSearch, populateSearchByYear } from "../utils/api";

export const SET_SEARCH_TYPE = "SET_SEARCH_TYPE";
export const RESET_SEARCH_TYPE = "RESET_SEARCH_TYPE";
export const SET_SEARCH_TERM = "SET_SEARCH_TERM";
export const RESET_SEARCH = "RESET_SEARCH";
export const SEARCH_ALL = "SEARCH_ALL";
export const SEARCH_ZIPCODE = "SEARCH_ZIPCODE";
export const SEARCH_SPECULATOR = "SEARCH_SPECULATOR";
export const SEARCH_ADDRESS = "SEARCH_ADDRESS";

export function setSearchType(type) {
  return {
    type: SET_SEARCH_TYPE,
    payload: {
      searchType: type
    }
  };
}

export function resetSearchType() {
  return {
    type: RESET_SEARCH_TYPE,
    payload: {
      searchType: "All"
    }
  };
}

export function setSearchTerm(searchTerm) {
  return {
    type: SET_SEARCH_TERM,
    payload: { searchTerm }
  };
}

export function resetSearch() {
  return {
    type: RESET_SEARCH,
    payload: { searchTerm: "", partialResults: [], fullResults: [] }
  };
}

function searchPartialZipcode(partialResults) {
  return {
    type: SEARCH_ZIPCODE,
    payload: {
      partialResults
    }
  };
}

function searchPartialSpeculator(partialResults) {
  return {
    type: SEARCH_SPECULATOR,
    payload: {
      partialResults
    }
  };
}

function searchPartialAddress(partialResults) {
  return {
    type: SEARCH_ADDRESS,
    payload: {
      partialResults
    }
  };
}

export function handleSearchPartialZipcode(searchTerm) {
  return async dispatch => {
    return populateSearch(
      searchTerm,
      `/api/zipcode-search/partial/`
    )
      .then(json => {
        dispatch(searchPartialZipcode(json));
        return json;
      })
      .catch(err => {
        //need to add some more error hadling
        throw Error(`An error occured searching: ${err}`);
      });
  };
}

export function handleSearchPartialAddress(searchTerm, year) {
  return async dispatch => {
    return populateSearchByYear(
      searchTerm,
      year,
      `/api/address-search/partial/`
    )
      .then(json => {
        dispatch(searchPartialAddress(json));
        return json;
      })
      .catch(err => {
        //need to add some more error hadling
        throw Error(`An error occured searching: ${err}`);
      });
  };
}

export function handleSearchPartialSpeculator(searchTerm, year) {
  return async dispatch => {
    return populateSearchByYear(
      searchTerm,
      year,
      `/api/speculator-search/partial/`
    )
      .then(json => {
        dispatch(searchPartialSpeculator(json));
        return json;
      })
      .catch(err => {
        //need to add some more error hadling
        throw Error(`An error occured searching: ${err}`);
      });
  };
}