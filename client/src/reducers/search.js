import {
  SET_SEARCH_TYPE,
  RESET_SEARCH_TYPE,
  SET_SEARCH_TERM,
  RESET_SEARCH_TERM,
  SEARCH_ZIPCODE
} from "../actions/search";

const initialSearchState = {
  searchType: "Zipcode",
  searchTerm: null,
  partialResults: null,
  fullResults: null
};

export default function searchState(state = initialSearchState, action) {
  switch (action.type) {
    case SET_SEARCH_TYPE:
      return { ...state, ...action.payload };
    case RESET_SEARCH_TYPE:
      return { ...state, ...action.payload };
    case SET_SEARCH_TERM:
      return { ...state, ...action.payload };
      case RESET_SEARCH_TERM:
            return { ...state, ...action.payload };
    case SEARCH_ZIPCODE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
