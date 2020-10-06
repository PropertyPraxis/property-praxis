import queryString from "query-string";

export function createMapParams(searchQuery, pathname) {
  const { search, coordinates, year } = queryString.parse(searchQuery);
  const type = pathname.split("/")[2];

  return { type, search, coordinates, year };
}
