import { WebMercatorViewport } from "react-map-gl";
import bbox from "@turf/bbox";

// funtion to create the new viwport to zoom to
export function createNewViewport(geojson, mapState) {
  const features = geojson.features;
  if (features) {
    const [minLng, minLat, maxLng, maxLat] = bbox(geojson);
    // construct a viewport instance from the current state
    const viewport = new WebMercatorViewport(mapState);

    const { longitude, latitude, zoom } = viewport.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat]
      ]
      // ,
      // {
      //   padding: 40
      // }
    );

    return { longitude, latitude, zoom};
  }
  return {
    latitude: 42.40230199308517,
    longitude: -83.11182404081912,
    zoom: 10
  };
}
