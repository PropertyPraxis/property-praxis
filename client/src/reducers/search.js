import {
  UPDATE_VIEWER_IMAGE,
  UPDATE_GENERAL_SEARCH,
  UPDATE_SEARCH_PARAMS,
  UPDATE_PRIMARY_SEARCH,
  UPDATE_DETAILED_SEARCH,
  UPDATE_SEARCH_BAR,
} from "../actions/search";

const initialSearchState = {
  searchBar: {
    searchYears: null,
  },
  searchParams: {
    searchType: "all",
    searchYear: "2017",
    searchTerm: "",
    searchCoordinates: null,
  },
  primarySearch: { results: null, index: 0, isOpen: false, isActive: false },
  detailedSearch: {
    results: null,
    drawerIsOpen: false,
    resultsType: null,
    recordYears: null,
  },
  downloadData: null,
  viewer: {
    bearing: null,
    key: null,
    viewerMarker: null,
  },
};

export default function searchState(state = initialSearchState, action) {
  switch (action.type) {
    case UPDATE_VIEWER_IMAGE:
      return { ...state, ...action.payload };
    case UPDATE_GENERAL_SEARCH:
      return { ...state, ...action.payload };
    case UPDATE_SEARCH_BAR:
      return { ...state, searchBar: { ...state.searchBar, ...action.payload } };
    case UPDATE_SEARCH_PARAMS:
      return {
        ...state,
        searchParams: { ...state.searchParams, ...action.payload },
      };
    case UPDATE_PRIMARY_SEARCH:
      return {
        ...state,
        primarySearch: { ...state.primarySearch, ...action.payload },
      };
    case UPDATE_DETAILED_SEARCH:
      return {
        ...state,
        detailedSearch: { ...state.detailedSearch, ...action.payload },
      };
    default:
      return state;
  }
}

// PRIMARY_SEARCH_QUERY,
// TOGGLE_DETAILED_RESULTS,
// UPDATE_DETAILED_RESULTS,
// TOGGLE_PRIMARY_RESULTS,
// TOGGLE_PRIMARY_ACTIVE,
// UPDATE_PRIMARY_RESULTS,
// UPDATE_PRIMARY_INDEX,
// GET_SEARCH_YEARS,
// GET_PRAXIS_SEARCH_YEARS,

///////
// case TOGGLE_DETAILED_RESULTS:
//   return { ...state, ...action.payload };
// case UPDATE_DETAILED_RESULTS:
//   return { ...state, ...action.payload };
// case PRIMARY_SEARCH_QUERY:
//   return { ...state, ...action.payload };
// case TOGGLE_PRIMARY_RESULTS:
//   return { ...state, ...action.payload };
// case TOGGLE_PRIMARY_ACTIVE:
//   return { ...state, ...action.payload };
// case UPDATE_PRIMARY_RESULTS:
//   return { ...state, ...action.payload };
// case UPDATE_PRIMARY_INDEX:
//   return { ...state, ...action.payload };
// case GET_SEARCH_YEARS:
//   return { ...state, ...action.payload };
// case GET_PRAXIS_SEARCH_YEARS:
//   return { ...state, ...action.payload };
// case TOGGLE_DETAILED_RESULTS:
//   return { ...state, ...action.payload };
///////
