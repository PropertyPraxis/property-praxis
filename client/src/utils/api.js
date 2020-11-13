import queryString from "query-string";
// function to build routes depending on search params
export async function APISearchQueryFromParams(
  { searchType, searchTerm, searchCoordinates = null, searchYear },
  route
) {
  try {
    let response;
    if (searchTerm === "") {
      return [];
    } else if (searchType && searchTerm && searchYear) {
      if (searchType === "address" && !searchCoordinates) {
        response = await fetch(
          `${route}${encodeURIComponent(searchTerm)}/${searchYear}`
        );
      } else if (searchType === "address" && searchCoordinates) {
        response = await fetch(
          `${route}${encodeURIComponent(searchCoordinates)}/${searchYear}`
        );
      } else if (["speculator", "zipcode"].includes(searchType)) {
        response = await fetch(
          `${route}${encodeURIComponent(searchTerm)}/${searchYear}`
        );
      } else {
        throw new Error(`An error occured creating search route.`);
      }
      return await response.json();
    }
  } catch (err) {
    throw Error(`An error occured querying API from params: ${err}`);
  }
}

export async function APISearchQueryFromParamsPROTO(
  { type, ownid = null, code = null, place = null, coordinates = null, year },
  route
) {
  try {
    let qs;
    switch (type) {
      case "address":
        qs = `${route}?${queryString.stringify(
          { type, place, coordinates, year },
          { sort: false, skipNull: true }
        )}`;
        break;
      case "zipcode":
        qs = `${route}?${queryString.stringify(
          { type, code, year },
          { sort: false, skipNull: true }
        )}`;
        break;
      case "speculator":
        qs = `${route}?${queryString.stringify(
          { type, ownid, year },
          { sort: false, skipNull: true }
        )}`;
        break;
      default:
        console.error(`Unknown API search query type: ${type}`);
    }

    const response = await fetch(qs);
    const json = await response.json();
    return json;
  } catch (err) {
    throw Error(`An error occured querying API from params: ${err}`);
  }
}

export async function APISearchQueryFromRoute(route) {
  try {
    const respose = await fetch(route);
    const json = await respose.json();
    return json;
  } catch (err) {
    throw new Error(`An error occurred querying API from route: ${err}`);
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
    throw Error(`An error occured searching: ${err}`);
  }
}

// export async function APIParcelQueryFromRoute(route) {
//   try {
//     const respose = await fetch(route);
//     const json = await respose.json();
//     if (isGeoJSONEmpty(json)) {
//       return null;
//     } else {
//       return json;
//     }

//     return json;
//   } catch (err) {
//     throw new Error(`An error occurred querying API from route: ${err}`);
//   }
// }
