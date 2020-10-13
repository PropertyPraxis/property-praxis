import queryString from "query-string";

export function createMapParams(searchQuery, pathName) {
  const { type, search, coordinates, year } = queryString.parse(searchQuery);

  return { type, search, coordinates, year };
}
