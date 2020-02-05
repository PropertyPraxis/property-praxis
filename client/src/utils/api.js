import pDebounce from "p-debounce";

//function to get data on map load
export async function getInitialMapData(route) {
  const mapDataResponse = await fetch(route);
  if (mapDataResponse.status === 200) {
    const mapDataJson = await mapDataResponse.json();
    return mapDataJson;
  }
  throw new Error(mapDataResponse.status);
}

export async function getInitialZipcodeData(route) {
  const mapDataResponse = await fetch(route);
  if (mapDataResponse.status === 200) {
    const mapDataJson = await mapDataResponse.json();
    return mapDataJson;
  }
  throw new Error(mapDataResponse.status);
}

//debouncing for searches
const populateSearch = async function(searchTerm, route) {
  //route can be either <host>/api/zipcode-search/ or <host>/api/address-search/ or <host>/api/speculator-search/
  if (searchTerm === "") {
    return { data: {} };
  } else {
    const response = await fetch(route + encodeURIComponent(searchTerm));
    const json = await response.json();
    if (response.status !== 200) {
      throw Error(`An error occured searching: ${json.message}`);
    }
    return json;
  }
};
//debounce the search
export const debouncedPopulateSearch = pDebounce(populateSearch, 500);

// export async function getZipcodeData(route, searchTerm) {
//   const uri = `${route}${encodeURIComponent(searchTerm)}`;
//   const response = await fetch(uri);
//   const json = await response.json();

//   if (!response.ok || response.status !== 200) {
//     window.alert(`An error occurred:
//     ${json.message}`);
//     throw Error(response.statusText);
//   }
//   return json;
// }
