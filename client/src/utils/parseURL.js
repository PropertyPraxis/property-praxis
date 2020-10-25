import queryString from "query-string";

/*Default search params */
const defaultParams = {
  type: "zipcode",
  search: "48209",
  coordinates: null,
  year: "2020",
};

export function parseURLParams(searchQuery) {
  let {
    type: searchType,
    search: searchTerm,
    coordinates: searchCoordinates,
    year: searchYear,
  } = queryString.parse(searchQuery);

  if (searchType === undefined) {
    searchType = defaultParams.type;
  }
  if (searchTerm === undefined) {
    searchTerm = defaultParams.search;
  }
  if (searchCoordinates === undefined) {
    searchCoordinates = defaultParams.searchCoordinates;
  }
  if (searchYear === undefined) {
    searchYear = defaultParams.searchYear;
  }

  return {
    searchType,
    searchTerm,
    searchCoordinates,
    searchYear,
  };
}
