import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleGetViewerImage } from "../../actions/search";
import { calculateDesiredBearing, bearingToBasic } from "../../utils/viewer";
import { Viewer, SimpleMarker } from "mapillary-js";
import * as turf from "@turf/turf";

// test images
// 1456011628085234
// 158792956297878
// 490232582209226
// 911499166077898
// 1986938741445478
// working on refresh
// http://localhost:3000/map?type=address&place=17315%20Fenton&coordinates=%257B%2522longitude%2522%3A-83.28279195454097%2C%2522latitude%2522%3A42.41714576967229%257D&year=2020

// const ORG_KEY = "NZ8NFgreZHnVBmPwrtGYEA"; // city of detroit
// const ORG_KEY = "codegis";

const accessToken = "MLY|4790260297730810|2c2446b85cd5a589a6e1cd43aa3b3525";

function createMarker(markerId, lngLat, color) {
  const marker = new SimpleMarker(markerId, lngLat, {
    ballColor: "red",
    ballOpacity: 0.9,
    color,
    opacity: 0.5,
    interactive: true,
  });
  return marker;
}

function useImageKey(searchCoordinates) {
  const [imageId, setImageId] = useState(null);

  const { longitude, latitude } = JSON.parse(decodeURI(searchCoordinates));

  const point = turf.point([longitude, latitude]);
  const buffered = turf.buffer(point, 100, { units: "meters" });
  const bbox = turf.bbox(buffered);

  // API params
  const [minx, miny, maxx, maxy] = bbox;
  // const organization_id = 104740425095586; TODO: keep investigating for codgis
  const fields = "id,geometry,captured_at,compass_angle";
  const limit = 25;

  useEffect(() => {
    (async () => {
      const query = `https://graph.mapillary.com/images?access_token=${accessToken}&fields=${fields}&bbox=${minx},${miny},${maxx},${maxy}&limit${limit}`;
      console.log(query);

      const res = await fetch(query);
      const json = await res.json();

      const imageIdClose = json.data.map((item) => {
        console.log(item);
        return item.id;
        // calculate the distance and choose closest image key
      })[0]; // temporary

      setImageId(imageIdClose);
    })();
    return () => null;
  }, [searchCoordinates]);

  return { imageId };
}

function MapViewerV4({ searchState }) {
  const { searchCoordinates } = searchState.searchParams;
  const { imageId } = useImageKey(searchCoordinates);

  useEffect(() => {
    if (imageId && searchCoordinates) {
      const componentOptions = {
        cover: false,
        marker: true,
      };

      let viewer = new Viewer({
        accessToken,
        container: "mly",
        imageId,
        component: componentOptions,
      });

      // add marker
      const coords = JSON.parse(decodeURIComponent(searchCoordinates));
      const markerComponent = viewer.getComponent("marker");
      markerComponent.add([
        createMarker(
          "test",
          { lat: coords.latitude, lng: coords.longitude },
          "red"
        ),
      ]);

      viewer.on("bearing", function () {
        console.log("A bearing event has occurred.");
        console.log(viewer.getBearing());
      });
    }

    return () => null;
  }, [imageId, searchCoordinates]);
  return <div id="mly"></div>;
}

export default MapViewerV4;
