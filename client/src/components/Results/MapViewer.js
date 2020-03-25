import React, { Component } from "react";
// import PropTypes from "prop-types";
// import * as Mapillary from "mapillary-js";
import { MapillaryViewer } from "react-mapillary";
// import { handleGetViewerImageAction } from "../../actions/results";
import "../../scss/Results.scss";

class MapViewer extends Component {
  componentDidMount() {}

  componentDidUpdate(prevProps) {}

  render() {
    const { key } = this.props.results.viewer;
    if (key) {
      // this logic will need to move up
      return (
        <div
          // onKeyDown={handleKeyDown}
          role="button"
          tabIndex="-1"
          className="map-viewer"
        >
          <MapillaryViewer
            clientId="S3NrdE1uVHdoRVhQeFN6WUZCTzItUTo5MGFlYTRiNjg3ODAxNTNi"
            imageKey={key}
            //   filter={["==", "userKey", "2PiRXqdqbY47WzG6CRzEIA"]}
            // onTiltChanged={tilt => console.log(`Tilt: ${tilt}`)}
            // onFovChanged={fov => console.log(`FoV: ${fov}`)}
            // onNodeChanged={node => console.log("node:", node)}
            // onBearingChanged={bearing => console.log(`Bearing: ${bearing}`)}
          />
        </div>
      );
    }
    return <div>Loading Image...</div>;
  }
}

export default MapViewer;
