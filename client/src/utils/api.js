import queryString from "query-string";

export async function APIQueryStringFromSearchParams(
  { searchType, searchTerm, searchCoordinates = null, searchYear },
  route
) {
  try {
    if (searchTerm === "") {
      return [];
    }
    let qs;
    switch (searchType) {
      case "address":
        qs = `${route}?${queryString.stringify(
          {
            type: searchType,
            place: searchTerm,
            coordinates: searchCoordinates,
            year: searchYear,
          },
          { sort: false, skipNull: true }
        )}`;
        break;
      case "zipcode":
        qs = `${route}?${queryString.stringify(
          { type: searchType, code: searchTerm, year: searchYear },
          { sort: false, skipNull: true }
        )}`;
        break;
      case "speculator":
        qs = `${route}?${queryString.stringify(
          { type: searchType, ownid: searchTerm, year: searchYear },
          { sort: false, skipNull: true }
        )}`;
        break;
      default:
        console.error(
          `Search failed. Unknown API search param type: ${searchType}`
        );
        qs = null;
        break;
    }

    const response = await fetch(qs);
    return await response.json();
  } catch (err) {
    console.error(`An error occured querying API from params: ${err}`);
  }
}

export async function APISearchQueryFromRoute(route) {
  try {
    const respose = await fetch(route);
    const json = await respose.json();
    return json;
  } catch (err) {
    console.error(`An error occurred querying API from route: ${err}`);
  }
}

export function isGeoJSONEmpty(geojson) {
  if (geojson && geojson.features.length === 0) {
    return true;
  } else {
    return false;
  }
}

//function helper for downloading data
export async function getDownloadData(route) {
  try {
    const response = await fetch(route);
    const json = await response.json();
    return json;
  } catch (err) {
    console.error(`An error searching download data: ${err}`);
  }
}
