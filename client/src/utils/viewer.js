import * as turf from "@turf/turf";

//function to get an image key
//using the mapillary api
const MAPILLARY_CLIENT_ID =
  "S3NrdE1uVHdoRVhQeFN6WUZCTzItUTo5MGFlYTRiNjg3ODAxNTNi";
const USER_KEY = "XiyggdTq2tc0ZSL8u3TtxA"; //codgis
const ORG_KEY = "NZ8NFgreZHnVBmPwrtGYEA"; // city of detroit

export async function getImageKey(longitude, latitude) {
  try {
    const addressMarker = turf.point([longitude, latitude]);
    const lookAtRoute = `https://a.mapillary.com/v3/images?client_id=${MAPILLARY_CLIENT_ID}&lookat=${longitude},${latitude}&closeto=${longitude},${latitude}&organization_keys=${ORG_KEY}`;
    const lookAtResponse = await fetch(lookAtRoute);
    const lookAtJson = await lookAtResponse.json();

    // need to return the key here
    if (lookAtJson.features.length > 0) {
      // get coordinates of the viewer
      const { coordinates } = lookAtJson.features[0].geometry;
      //get the image key
      const { key } = lookAtJson.features[0].properties;

      //then create a point
      const viewerMarker = turf.point(coordinates);
      const bearing = turf.bearing(viewerMarker, addressMarker);
      return { key, bearing, viewerMarker };
    }

    // if no features are returned use closeto instead
    if (lookAtJson.features.length === 0) {
      const closeToRoute = `https://a.mapillary.com/v3/images?client_id=${MAPILLARY_CLIENT_ID}&closeto=${longitude},${latitude}&organization_keys=${ORG_KEY}`;
      const closeToResponse = await fetch(closeToRoute);
      const closeToJson = await closeToResponse.json();

      // get coordinates of the viewer
      const { coordinates } = closeToJson.features[0].geometry;
      //get the image key
      const { key } = closeToJson.features[0].properties;
      // then create a point
      const viewerMarker = turf.point(coordinates);
      const bearing = turf.bearing(viewerMarker, addressMarker);

      return { key, bearing, viewerMarker };
    }

    return {
      bearing: null,
      key: null,
      viewerMarker: null
    };
  } catch (err) {
    throw new Error(err);
  }
}
