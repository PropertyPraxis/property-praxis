import {
  SET_SEARCH_TYPE,
  RESET_SEARCH_TYPE,
  SET_SEARCH_TERM,
  RESET_SEARCH,
  SEARCH_ZIPCODE,
  SEARCH_ADDRESS,
  SEARCH_SPECULATOR
} from "../actions/search";

const initialSearchState = {
  searchType: "Zipcode",
  searchTerm: "",
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
    case SEARCH_ZIPCODE:
      return { ...state, ...action.payload };
    case SEARCH_ADDRESS:
      return { ...state, ...action.payload };
      case SEARCH_SPECULATOR:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
