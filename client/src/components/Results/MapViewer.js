import React, { Component } from "react";
import PropTypes from "prop-types";
// import * as Mapillary from "mapillary-js";
import { MapillaryViewer } from "react-mapillary";

class MapViewer extends Component {
  componentDidMount() {}

  render() {
    return (
      <div
        // onKeyDown={handleKeyDown}
        role="button"
        tabIndex="-1"
        style={{
          width: "200px",
          height: "200px"
        }}
      >
        <MapillaryViewer
          clientId="QjI1NnU0aG5FZFZISE56U3R5aWN4Zzo3NTM1MjI5MmRjODZlMzc0"
          imageKey="085Gpl_xNxW1Lw2eeEG28w"
          filter={["==", "userKey", "2PiRXqdqbY47WzG6CRzEIA"]}
          onTiltChanged={tilt => console.log(`Tilt: ${tilt}`)}
          onFovChanged={fov => console.log(`FoV: ${fov}`)}
          onNodeChanged={node => console.log(node)}
          onBearingChanged={bearing => console.log(`Bearing: ${bearing}`)}
        />
      </div>
    );
  }
}

export default MapViewer;
