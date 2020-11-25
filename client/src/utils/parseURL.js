import queryString from "query-string";

/*Default search params */
const defaultParams = {
  type: "zipcode",
  search: "48209",
  coordinates: null,
  year: "2020",
};

export function URLParamsToSearchParams(searchQuery) {
  const {
    type: searchType = null,
    code = null,
    ownid = null,
    place = null,
    coordinates: searchCoordinates = null,
    year: searchYear = null,
  } = queryString.parse(searchQuery);

  let searchTerm;

  // this assumes that there can only be one search term
  switch (searchType) {
    case "zipcode":
      searchTerm = code;
      break;
    case "speculator":
      searchTerm = ownid;
      break;
    case "address":
      searchTerm = place;
      break;
    default:
      console.error(`Unkown search type:${searchType}`);
      break;
  }

  return {
    searchType,
    searchTerm,
    searchCoordinates,
    searchYear,
  };
}

export function URLParamsToAPIQueryString(searchQuery) {
  const {
    type = null,
    ownid = null,
    code = null,
    place = null,
    year = null,
    coordinates = null,
  } = queryString.parse(searchQuery);

  switch (type) {
    case "zipcode":
      if (code && ownid && year) {
        return `/api/geojson?type=parcels-by-code-speculator&code=${code}&ownid=${ownid}&year=${year}`;
      } else if (code && year) {
        return `/api/geojson?type=parcels-by-code&code=${code}&year=${year}`;
      } else {
        return null;
      }
    case "speculator":
      if (ownid && code && year) {
        return `/api/geojson?type=parcels-by-speculator-code&ownid=${ownid}&code=${code}&year=${year}`;
      } else if (ownid && year) {
        return `/api/geojson?type=parcels-by-speculator&ownid=${ownid}&year=${year}`;
      } else {
        return null;
      }

    case "address":
      if (place && coordinates && year) {
        return `/api/geojson?type=parcels-by-geocode&place=${place}&coordinates=${coordinates}&year=${year}`;
      } else {
        return null;
      }
    default:
      return null;
  }
}
