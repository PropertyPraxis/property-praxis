import { WebMercatorViewport } from "react-map-gl"
import bbox from "@turf/bbox"

// function to create the new viewport to zoom to
export function createNewViewport(geojson, mapState) {
  const { features } = geojson
  let featureCount = 0
  if (features && features.length > 0) {
    //check to make sure the features have geometries
    const reducer = (accumulator, currentValue) => accumulator + currentValue
    featureCount = features
      .map((feature) => {
        if (feature.geometry.geometries)
          return feature.geometry.geometries.length
        if (feature.geometry.coordinates)
          return feature.geometry.coordinates.length

        return 0
      })
      .reduce(reducer)
  }

  // create the appropriate
  if (features && featureCount > 0) {
    const [minLng, minLat, maxLng, maxLat] = bbox(geojson)
    // construct a viewport instance from the current state
    const viewport = new WebMercatorViewport(mapState)
    // Note: padding has been known to cause odd errors
    const { longitude, latitude, zoom } = viewport.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: 40,
      }
    )

    return { longitude, latitude, zoom }
  } else if (geojson.geometry && geojson.geometry.type === "Point") {
    //if it is a point return this
    const [longitude, latitude] = geojson.center
    return { longitude, latitude, zoom: 15 }
  } else {
    return {
      latitude: 42.40230199308517,
      longitude: -83.11182404081912,
      zoom: 10,
    }
  }
}

export function coordsFromWKT(wkt) {
  if (wkt === "POINT EMPTY") return null

  //else do this
  const coordsArray = wkt.replace("POINT(", "").replace(")", "").split(" ")
  return {
    longitude: Number(coordsArray[0]),
    latitude: Number(coordsArray[1]),
  }
}
