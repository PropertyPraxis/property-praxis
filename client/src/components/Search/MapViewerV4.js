import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Viewer } from "mapillary-js";
import * as turf from "@turf/turf";

function useImageKey(searchCoordinates) {
  const [data, setData] = useState(null);

  const { longitude, latitude } = JSON.parse(decodeURI(searchCoordinates));
  const point = turf.point([longitude, latitude]);
  const buffered = turf.buffer(point, .1, { units: "kilometers" });
  const bbox = turf.bbox(buffered);

  const [minx, miny, maxx, maxy] = bbox;

  useEffect(() => {
    (async () => {
      const token = "MLY|4790260297730810|2c2446b85cd5a589a6e1cd43aa3b3525";
      const query = `https://graph.mapillary.com/images?access_token=${token}&fields=id,geometry&bbox=${minx},${miny},${maxx},${maxy}`;

      const res = await fetch(query);
      const json = await res.json();
      setData(json);
    })();
    return () => null;
  }, [searchCoordinates]);

  return { data };
}

function MapViewerV4({ searchState }) {
  const { searchCoordinates } = searchState.searchParams;
  const { data } = useImageKey(searchCoordinates);

  if (searchCoordinates) {
    return (
      <>
        {/* <div id="mly">{JSON.stringify(data)}</div> */}
        <div>{JSON.stringify(data)}</div>
      </>
    );
  }
}

export default MapViewerV4;
