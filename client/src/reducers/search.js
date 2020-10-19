import {
  SET_SEARCH_TYPE,
  RESET_SEARCH_TYPE,
  SET_SEARCH_TERM,
  RESET_SEARCH,
  SET_SEARCH_DISPLAY_TYPE,
  SEARCH_PARTIAL_ZIPCODE,
  SEARCH_FULL_ZIPCODE,
  SEARCH_PARTIAL_ADDRESS,
  SEARCH_FULL_ADDRESS,
  SEARCH_PARTIAL_SPECULATOR,
  SEARCH_FULL_SPECULATOR,
  SEARCH_PARTIAL_ALL,
  PRIMARY_SEARCH_QUERY,
} from "../actions/search";

const initialSearchState = {
  searchType: "all",
  searchTerm: null,
  searchCoordinates: null,
  searchYear: "2017",
  partialResults: [],
  primaryResults: [],
  fullResults: [],
  downloadData: null,
  searchDisplayType: null,
  isFullResultsOpen: false,
  isPartialResultsOpen: false,
};

export default function searchState(state = initialSearchState, action) {
  switch (action.type) {
    case SET_SEARCH_TYPE:
      return { ...state, ...action.payload };
    case RESET_SEARCH_TYPE:
      return { ...state, ...action.payload };
    case SET_SEARCH_TERM:
      return { ...state, ...action.payload };
    case RESET_SEARCH:
      return { ...state, ...action.payload };
    case SET_SEARCH_DISPLAY_TYPE:
      return { ...state, ...action.payload };
    case PRIMARY_SEARCH_QUERY:
      return { ...state, ...action.payload };
    case SEARCH_PARTIAL_ZIPCODE:
      return { ...state, ...action.payload };
    case SEARCH_FULL_ZIPCODE:
      return { ...state, ...action.payload };
    case SEARCH_PARTIAL_ADDRESS:
      return { ...state, ...action.payload };
    case SEARCH_FULL_ADDRESS:
      return { ...state, ...action.payload };
    case SEARCH_PARTIAL_SPECULATOR:
      return { ...state, ...action.payload };
    case SEARCH_FULL_SPECULATOR:
      return { ...state, ...action.payload };
    case SEARCH_PARTIAL_ALL:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
