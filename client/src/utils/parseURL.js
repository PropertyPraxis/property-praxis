import queryString from "query-string";

export function parseURLParams(searchQuery) {
  let {
    type: searchType,
    search: searchTerm,
    coordinates: searchCoordinates,
    year: searchYear,
  } = queryString.parse(searchQuery);

  if (searchType === undefined) searchType = null;
  else if (searchTerm === undefined) searchTerm = null;
  else if (searchCoordinates === undefined) searchCoordinates = null;

  return {
    searchType,
    searchTerm,
    searchCoordinates,
    searchYear,
  };
}
