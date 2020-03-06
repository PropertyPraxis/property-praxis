import {
  SET_SEARCH_TYPE,
  RESET_SEARCH_TYPE,
  SET_SEARCH_TERM,
  RESET_SEARCH,
  SET_SEARCH_DISPLAY_TYPE,
  SEARCH_PARTIAL_ZIPCODE,
  SEARCH_FULL_ZIPCODE,
  SEARCH_ADDRESS,
  SEARCH_SPECULATOR
} from "../actions/search";

const initialSearchState = {
  searchType: "Zipcode",
  searchTerm: "",
  searchDisplayType: null,
  partialResults: [],
  fullResults: []
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
    case SEARCH_PARTIAL_ZIPCODE:
      return { ...state, ...action.payload };
    case SEARCH_FULL_ZIPCODE:
      return { ...state, ...action.payload };
    case SEARCH_ADDRESS:
      return { ...state, ...action.payload };
    case SEARCH_SPECULATOR:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
