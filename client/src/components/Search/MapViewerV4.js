import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleGetViewerImage } from "../../actions/search";
import { calculateDesiredBearing, bearingToBasic } from "../../utils/viewer";
import { Viewer, SimpleMarker } from "mapillary-js";
import { init, dispose } from "../../utils/viewerv4";
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

function useImageKey(searchCoordinates) {
  const [imageId, setImageId] = useState(null);

  const { longitude, latitude } = JSON.parse(decodeURI(searchCoordinates));

  const point = turf.point([longitude, latitude]);
  const buffered = turf.buffer(point, 100, { units: "meters" });
  const bbox = turf.bbox(buffered);

  const [minx, miny, maxx, maxy] = bbox;

  useEffect(() => {
    (async () => {
      // const token = "MLY|4790260297730810|2c2446b85cd5a589a6e1cd43aa3b3525";
      // &organization_id=${ORG_KEY}
      const query = `https://graph.mapillary.com/images?access_token=${accessToken}&fields=id,geometry&bbox=${minx},${miny},${maxx},${maxy}`;
      console.log(query);

      const res = await fetch(query);
      const json = await res.json();

      const imageIdClose = json.data.map((item) => {
        return item.id;
        // calculate the distance and choose closest image key
      })[0]; // temporary

      setImageId(imageIdClose);
    })();
    return () => null;
  }, [searchCoordinates]);

  return { imageId };
}
// function useViewer({ searchCoordinates }) {
//   const [imageId, setImageId] = useSate(null);

//   useEffect(() => {
//     setImageId("1182252392217616");

//     return () => null;
//   }, [searchCoordinates]);
// }

// function MapViewerV4({ searchState }) {
//   const viewerEl = useRef(null);
//   const { searchCoordinates } = searchState.searchParams;
//   const { data } = useImageKey(searchCoordinates);
//   useEffect(() => {
//     if (data) {
//       init({
//         accessToken,
//         container: "mly",
//       });
//     }
//     return () => {
//       // return null;
//       dispose();
//     };
//   }, [data]);

//   return <div id="mly" ref={viewerEl}></div>;
// }

// function MapViewerV4() {
//   const ref = useRef(null);
//   const [viewer, setViewer] = useState(null);
//   useEffect(() => {
//     if (ref.current && !viewer) {
//       console.log("xxxxxxxxxxxxxxxx", viewer);

//       let viewer = new Viewer({
//         accessToken: "MLY|4790260297730810|2c2446b85cd5a589a6e1cd43aa3b3525",
//         container: "xxx", // the ID of our container defined in the HTML body
//         imageId: "1456011628085234",
//       });
//       setViewer(viewer);
//     }
//   }, [ref, viewer]);
//   return <div id="xxx" ref={ref} />;
// }

// class MapViewerV4 extends React.Component {
//   constructor(props) {
//     super(props);
//     this.containerRef = React.createRef();
//   }

//   componentDidMount() {
//     debugger;

//     this.viewer = new Viewer({
//       accessToken: this.props.accessToken,
//       // container: this.containerRef.current,
//       container: "mly",
//       imageId: this.props.imageId,
//     });
//   }

//   componentWillUnmount() {
//     if (this.viewer) {
//       this.viewer.remove();
//     }
//   }

//   render() {
//     return <div id="mly" ref={this.containerRef} style={this.props.style} />;
//   }
// }

////////////////////////////
function makeContainer(parent) {
  const container = document.createElement("div");
  container.style.width = "calc(25% - 2px)";
  container.style.height = "calc(100% - 2px)";
  container.style.display = "inline-block";
  container.style.margin = "1px";
  parent.appendChild(container);
  return container;
}

function MapViewerV4({ searchState }) {
  const { searchCoordinates } = searchState.searchParams;
  const { imageId } = useImageKey(searchCoordinates);
  useEffect(() => {
    if (imageId && searchCoordinates) {
      let viewer = new Viewer({
        accessToken,
        container: "mly",
        imageId,
      });
    }

    return () => null;
  }, [imageId, searchCoordinates]);
  return <div id="mly"></div>;
}

export default MapViewerV4;
