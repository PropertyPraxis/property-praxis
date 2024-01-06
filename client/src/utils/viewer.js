import * as turf from "@turf/turf"

//function to get an image key
//using the mapillary api
const MAPILLARY_CLIENT_ID =
  "S3NrdE1uVHdoRVhQeFN6WUZCTzItUTo5MGFlYTRiNjg3ODAxNTNi"
const USER_KEY = "XiyggdTq2tc0ZSL8u3TtxA" //codgis
const ORG_KEY = "NZ8NFgreZHnVBmPwrtGYEA" // city of detroit

export async function getImageKey(longitude, latitude) {
  try {
    const addressMarker = turf.point([longitude, latitude])
    const lookAtRoute = `https://a.mapillary.com/v3/images?client_id=${MAPILLARY_CLIENT_ID}&lookat=${longitude},${latitude}&closeto=${longitude},${latitude}&organization_keys=${ORG_KEY}`
    const lookAtResponse = await fetch(lookAtRoute)
    const lookAtJson = await lookAtResponse.json()

    // need to return the key here
    if (lookAtJson.features.length > 0) {
      // get coordinates of the viewer
      const { coordinates } = lookAtJson.features[0].geometry
      //get the image key
      const { key } = lookAtJson.features[0].properties

      //then create a point
      const viewerMarker = turf.point(coordinates)
      const bearing = turf.bearing(viewerMarker, addressMarker)
      return { key, bearing, viewerMarker }
    }

    // if no features are returned use closeto instead
    if (lookAtJson.features.length === 0) {
      const closeToRoute = `https://a.mapillary.com/v3/images?client_id=${MAPILLARY_CLIENT_ID}&closeto=${longitude},${latitude}&organization_keys=${ORG_KEY}`
      const closeToResponse = await fetch(closeToRoute)
      const closeToJson = await closeToResponse.json()

      if (closeToJson.features[0] !== undefined) {
        // get coordinates of the viewer
        const { coordinates } = closeToJson.features[0].geometry
        //get the image key
        const { key } = closeToJson.features[0].properties
        // then create a point
        const viewerMarker = turf.point(coordinates)
        const bearing = turf.bearing(viewerMarker, addressMarker)

        return { key, bearing, viewerMarker }
      }
      //else if there is no geom return nulls
      return {
        bearing: null,
        key: null,
        viewerMarker: null,
      }
    }

    return {
      bearing: null,
      key: null,
      viewerMarker: null,
    }
  } catch (err) {
    throw new Error(err)
  }
}

export function getBearing(viewerCoords, addressCoords) {
  const viewerPoint = turf.point(viewerCoords)
  const addressPoint = turf.point(addressCoords)
  return turf.bearing(viewerPoint, addressPoint)
}

export function wrap(value, min, max) {
  var interval = max - min

  while (value > max || value < min) {
    if (value > max) {
      value = value - interval
    } else if (value < min) {
      value = value + interval
    }
  }

  return value
}

// Converts from degrees to radians.
function toRadians(degrees) {
  return (degrees * Math.PI) / 180
}

// Converts from radians to degrees.
function toDegrees(radians) {
  return (radians * 180) / Math.PI
}

export function calculateDesiredBearing(startLat, startLng, destLat, destLng) {
  startLat = toRadians(startLat)
  startLng = toRadians(startLng)
  destLat = toRadians(destLat)
  destLng = toRadians(destLng)

  const y = Math.sin(destLng - startLng) * Math.cos(destLat)
  const x =
    Math.cos(startLat) * Math.sin(destLat) -
    Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng)
  const brng = toDegrees(Math.atan2(y, x))

  return (brng + 360) % 360
}

/* Convert a desired bearing to a basic X image coordinate for
a specific node bearing.
Works only for a full 360 panorama. */
export function bearingToBasic(desiredBearing, nodeBearing) {
  const basic = (desiredBearing - nodeBearing) / 360 + 0.5
  return wrap(basic, 0, 1)
}
