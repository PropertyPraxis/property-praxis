import {
  RESET_SEARCH,
  PRIMARY_SEARCH_QUERY,
  TOGGLE_DETAILED_RESULTS,
  UPDATE_DETAILED_RESULTS,
  TOGGLE_PRIMARY_RESULTS,
  TOGGLE_PRIMARY_ACTIVE,
  UPDATE_PRIMARY_RESULTS,
  UPDATE_PRIMARY_INDEX,
  GET_SEARCH_YEARS,
  GET_PRAXIS_SEARCH_YEARS,
  GET_VIEWER_IMAGE,
} from "../actions/search";

const initialSearchState = {
  // searchBar: {
  //   searchYears: null,
  // },
  // searchParams: {
  //   searchType: "all",
  //   searchYear: "2017",
  //   searchTerm: "",
  //   searchCoordinates: null,
  // },
  // primarySearch: { results: null, index: 0, isOpen: false, isActive: false },
  // detailedSearch: {results: null, isOpen: false, detailsType: null, recordYears: null},
  searchType: "all",
  searchTerm: "",
  searchCoordinates: null,
  searchYear: "2017",
  searchYears: null,
  praxisSearchYears: null,
  primaryResults: null,
  detailedResults: null,
  primaryIndex: 0,
  downloadData: null,
  isDetailedResultsOpen: false,
  isPrimaryResultsOpen: false,
  isPrimaryResultsActive: false,
  viewer: {
    bearing: null,
    key: null,
    viewerMarker: null,
  },
};

export default function searchState(state = initialSearchState, action) {
  switch (action.type) {
    case RESET_SEARCH:
      return { ...state, ...action.payload };
    case TOGGLE_DETAILED_RESULTS:
      return { ...state, ...action.payload };
    case UPDATE_DETAILED_RESULTS:
      return { ...state, ...action.payload };
    case PRIMARY_SEARCH_QUERY:
      return { ...state, ...action.payload };
    case TOGGLE_PRIMARY_RESULTS:
      return { ...state, ...action.payload };
    case TOGGLE_PRIMARY_ACTIVE:
      return { ...state, ...action.payload };
    case UPDATE_PRIMARY_RESULTS:
      return { ...state, ...action.payload };
    case UPDATE_PRIMARY_INDEX:
      return { ...state, ...action.payload };
    case GET_SEARCH_YEARS:
      return { ...state, ...action.payload };
    case GET_PRAXIS_SEARCH_YEARS:
      return { ...state, ...action.payload };
    case GET_VIEWER_IMAGE:
      return { ...state, ...action.payload };
    case TOGGLE_DETAILED_RESULTS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
