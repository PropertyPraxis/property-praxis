//function to get data on map load
export async function getInitialMapData(route) {
  const mapDataResponse = await fetch(route);
  if (mapDataResponse.status === 200) {
    const mapDataJson = await mapDataResponse.json();
    return mapDataJson;
  }
  throw new Error(mapDataResponse.status);
}
