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
    contentIsVisible: false,
    resultsType: null,
    recordYears: null,
  },
  downloadData: null,
  viewer: null,
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

// viewer: {
//   bearing: null,
//   key: null,
//   viewerMarker: null,
// },
