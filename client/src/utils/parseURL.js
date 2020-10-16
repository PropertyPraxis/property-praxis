import queryString from "query-string";

export function parseURLParams(searchQuery) {
  let { type, search, coordinates, year } = queryString.parse(searchQuery);

  if (type === undefined) type = null;
  else if (search === undefined) search = null;
  else if (coordinates === undefined) coordinates = null;

  return { type, search, coordinates, year };
}
