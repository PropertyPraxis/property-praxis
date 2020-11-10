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
