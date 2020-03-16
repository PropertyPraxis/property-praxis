import { populateSearch, populateSearchByYear } from "../utils/api";

export const SET_SEARCH_TYPE = "SET_SEARCH_TYPE";
export const RESET_SEARCH_TYPE = "RESET_SEARCH_TYPE";
export const SET_SEARCH_TERM = "SET_SEARCH_TERM";
export const RESET_SEARCH = "RESET_SEARCH";
export const SET_SEARCH_DISPLAY_TYPE = "SET_SEARCH_DISPLAY_TYPE";
export const SEARCH_ALL = "SEARCH_ALL";
export const SEARCH_PARTIAL_ZIPCODE = "SEARCH_PARTIAL_ZIPCODE";
export const SEARCH_FULL_ZIPCODE = "SEARCH_FULL_ZIPCODE";
export const SEARCH_FULL_SPECULATOR = "SEARCH_FULL_SPECULATOR";
export const SEARCH_PARTIAL_SPECULATOR = "SEARCH_PARTIAL_SPECULATOR";
export const SEARCH_PARTIAL_ADDRESS = "SEARCH_PARTIAL_ADDRESS";
export const SEARCH_FULL_ADDRESS = "SEARCH_FULL_ADDRESS";

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

export function resetSearch(searchState) {
  return {
    type: RESET_SEARCH,
    payload: { ...searchState }
  };
}

export function setSearchDisplayType(searchDisplayType) {
  return {
    type: SET_SEARCH_DISPLAY_TYPE,
    payload: { searchDisplayType }
  };
}

export function searchPartialZipcode(partialResults) {
  return {
    type: SEARCH_PARTIAL_ZIPCODE,
    payload: {
      partialResults
    }
  };
}

function searchFullZipcode(fullResults) {
  return {
    type: SEARCH_FULL_ZIPCODE,
    payload: {
      fullResults
    }
  };
}

function searchPartialSpeculator(partialResults) {
  return {
    type: SEARCH_PARTIAL_SPECULATOR,
    payload: {
      partialResults
    }
  };
}

function searchFullSpeculator(fullResults) {
  return {
    type: SEARCH_FULL_SPECULATOR,
    payload: {
      fullResults
    }
  };
}

function searchPartialAddress(partialResults) {
  return {
    type: SEARCH_FULL_ADDRESS,
    payload: {
      partialResults
    }
  };
}

function searchFullAddress(fullResults) {
  return {
    type: SEARCH_PARTIAL_ADDRESS,
    payload: {
      fullResults
    }
  };
}

export function handleSearchPartialZipcode(searchTerm, year) {
  return async dispatch => {
    return populateSearchByYear(
      searchTerm,
      year,
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

export function handleSearchFullZipcode(searchTerm, year) {
  return async dispatch => {
    return populateSearchByYear(searchTerm, year, `/api/zipcode-search/full/`)
      .then(json => {
        dispatch(searchFullZipcode(json));
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

export function handleSearchFullAddress(searchTerm, year) {
  return async dispatch => {
    return populateSearchByYear(
      searchTerm,
      year,
      `/api/address-search/full/`
    )
      .then(json => {
        dispatch(searchFullAddress(json));
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

export function handleSearchFullSpeculator(searchTerm, year) {
  return async dispatch => {
    return populateSearchByYear(
      searchTerm,
      year,
      `/api/speculator-search/full/`
    )
      .then(json => {
        debugger;
        dispatch(searchFullSpeculator(json));
        return json;
      })
      .catch(err => {
        //need to add some more error hadling
        throw Error(`An error occured searching: ${err}`);
      });
  };
}
