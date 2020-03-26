import React, { Component } from "react";
// import PropTypes from "prop-types";
import * as Mapillary from "mapillary-js";
import { MapillaryViewer } from "react-mapillary";
// import { handleGetViewerImageAction } from "../../actions/results";
import "../../scss/Results.scss";

class MapViewer extends Component {
  componentDidMount() {
    const { key } = this.props.results.viewer;
    const { longitude, latitude } = this.props.mapData.marker;

    // Enable marker component when setting up viewer
    const mly = new Mapillary.Viewer(
      "mly",
      "S3NrdE1uVHdoRVhQeFN6WUZCTzItUTo5MGFlYTRiNjg3ODAxNTNi",
      null,
      {
        component: {
          cover: false,
          marker: true
        }
      }
    );

    // Create a non interactive simple marker with default options
    const defaultMarker = new Mapillary.MarkerComponent.SimpleMarker(
      "default-id",
      { lat: latitude, lon: longitude }
    );

    // Add markers to component
    const markerComponent = mly.getComponent("marker");
    markerComponent.add([defaultMarker]); //interactiveMarker,

    mly.moveCloseTo(latitude, longitude).then(
      function(node) {
        console.log("key is: ", node.key);
      },
      function(error) {
        console.error("move close to error: ", error);
        mly.moveToKey(key).catch(function(e) {
          console.error(e);
        });
      }
    );
    // Viewer size is dynamic so resize should be called every time the window size changes
    window.addEventListener("resize", function() {
      mly.resize();
    });
  }

  render() {
    return <div className="map-viewer" id="mly"></div>;
  }
}

//////REACT MAPILLARY VIEWER
// class MapViewer extends Component {

//   render() {
//     const { key } = this.props.results.viewer;
//     if (key) {
//       // this logic will need to move up
//       return (
//         <div
//           // onKeyDown={handleKeyDown}
//           role="button"
//           tabIndex="-1"
//           className="map-viewer"
//         >
//           <MapillaryViewer
//             clientId="S3NrdE1uVHdoRVhQeFN6WUZCTzItUTo5MGFlYTRiNjg3ODAxNTNi"
//             imageKey={key}
//             //   filter={["==", "userKey", "2PiRXqdqbY47WzG6CRzEIA"]}
//             // onTiltChanged={tilt => console.log(`Tilt: ${tilt}`)}
//             // onFovChanged={fov => console.log(`FoV: ${fov}`)}
//             // onNodeChanged={node => console.log("node:", node)}
//             // onBearingChanged={bearing => console.log(`Bearing: ${bearing}`)}
//           />
//         </div>
//       );
//     }
//     return <div>Loading Image...</div>;
//   }
// }

export default MapViewer;
