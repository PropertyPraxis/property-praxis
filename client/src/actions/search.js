import { debouncedPopulateSearch } from "../utils/api";

export const SET_SEARCH_TYPE = "SET_SEARCH_TYPE";
export const RESET_SEARCH_TYPE = "RESET_SEARCH_TYPE";
export const SET_SEARCH_TERM = "SET_SEARCH_TERM";
export const RESET_SEARCH_TERM = "SET_SEARCH_TERM";
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

export function resetSearchTerm() {
  return {
    type: RESET_SEARCH_TERM,
    payload: { searchTerm: null }
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

function searchSpeculator(data) {
  return {
    type: SEARCH_SPECULATOR,
    payload: {
      data
    }
  };
}

function searchAddress(data) {
  return {
    type: SEARCH_ADDRESS,
    payload: {
      data
    }
  };
}

export function handleSearchPartialZipcode(searchTerm) {
  return async dispatch => {
    return debouncedPopulateSearch(
      searchTerm,
      `http://localhost:5000/api/zipcode-search/partial/`
    )
      .then(json => {
        dispatch(searchPartialZipcode(json));
        return json;
      })
      .catch(err => {
        //need to add some more error hadling
        console.log(err);
      });
  };
}
