import { debouncedPopulateSearch } from "../utils/api";

const SET_SEARCH_TYPE = "SET_SEARCH_TYPE";
const RESET_SEARCH_TYPE = "RESET_SEARCH";
const SEARCH_ALL = "SEARCH_ALL";
const SEARCH_ZIPCODE = "SEARCH_ZIPCODE";
const SEARCH_SPECULATOR = "SEARCH_SPECULATOR";
const SEARCH_ADDRESS = "SEARCH_ADDRESS";

export function setSearchType(type) {
  return {
    type: SET_SEARCH_TYPE,
    payload: {
      searchType: type
    }
  };
}

export function resetSearch() {
  return {
    type: RESET_SEARCH,
    payload: {
      data: null
    }
  };
}

export function searchZipcode(data) {
  return {
    type: SEARCH_ZIPCODE,
    payload: {
      data
    }
  };
}

export function searchSpeculator(data) {
  return {
    type: SEARCH_SPECULATOR,
    payload: {
      data
    }
  };
}

export function searchAddress(data) {
  return {
    type: SEARCH_ADDRESS,
    payload: {
      data
    }
  };
}

export function handleSearchZipcode(searchTErm){
    return async dispatch => {
        return debouncedPopulateSearch(searchTerm, 'api/zipcode-search/')
          .then(json => {
            dispatch(searchParcel(json));
            return json;
          })
          .catch(err => {
            console.log(err);
          });
      };
}
