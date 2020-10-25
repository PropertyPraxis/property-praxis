import React, { Component } from "react";
import PropTypes from "prop-types";
import * as Mapillary from "mapillary-js";

class MapViewer extends Component {
  componentDidMount() {
    const { viewer, searchCoordinates } = this.props.searchState;

    const { longitude, latitude } = JSON.parse(searchCoordinates);

    // Enable marker component when setting up viewer
    const mly = new Mapillary.Viewer(
      "mly",
      "S3NrdE1uVHdoRVhQeFN6WUZCTzItUTo5MGFlYTRiNjg3ODAxNTNi",
      null,
      {
        component: {
          cover: false,
          marker: true,
        },
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
      function (node) {
        console.log("key is: ", node.key);
      },
      function (error) {
        console.error("move close to error: ", error);
        mly.moveToKey(viewer.key).catch(function (e) {
          console.error(e);
        });
      }
    );
    // Viewer size is dynamic so resize should be called every time the window size changes
    window.addEventListener("resize", function () {
      mly.resize();
    });
  }

  render() {
    return <div className="map-viewer" id="mly"></div>;
  }
}

MapViewer.propTypes = {
  results: PropTypes.shape({
    viewer: PropTypes.shape({ key: PropTypes.string.isRequired }.isRequired),
  }).isRequired,
};

export default MapViewer;
