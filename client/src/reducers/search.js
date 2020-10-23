import {
  RESET_SEARCH,
  SEARCH_FULL_ZIPCODE,
  SEARCH_FULL_ADDRESS,
  SEARCH_FULL_SPECULATOR,
  PRIMARY_SEARCH_QUERY,
  UPDATE_PRIMARY_INDEX,
  GET_SEARCH_YEARS
} from "../actions/search";

const initialSearchState = {
  searchType: "all",
  searchTerm: "",
  searchCoordinates: null,
  searchDisplayType: null,
  searchYear: "2017",
  searchYears: null,
  primaryResults: [],
  fullResults: [],
  primaryIndex: 0,
  downloadData: null,
  isFullResultsOpen: false,
  isPartialResultsOpen: false,
};

export default function searchState(state = initialSearchState, action) {
  switch (action.type) {
    case RESET_SEARCH:
      return { ...state, ...action.payload };
    case PRIMARY_SEARCH_QUERY:
      return { ...state, ...action.payload };
    case UPDATE_PRIMARY_INDEX:
      return { ...state, ...action.payload };
      case GET_SEARCH_YEARS:
      return { ...state, ...action.payload };
    case SEARCH_FULL_ZIPCODE:
      return { ...state, ...action.payload };
    case SEARCH_FULL_ADDRESS:
      return { ...state, ...action.payload };
    case SEARCH_FULL_SPECULATOR:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
