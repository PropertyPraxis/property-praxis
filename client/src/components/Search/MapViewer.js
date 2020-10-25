import React, { Component } from "react";
import PropTypes, { string } from "prop-types";
import { handleGetViewerImageAction } from "../../actions/search";
import * as Mapillary from "mapillary-js";

class MapViewer extends Component {
  _getViewerImage = ({ longitude, latitude }) => {
    this.props.dispatch(handleGetViewerImageAction(longitude, latitude));
  };

  async componentDidMount() {
    const { searchCoordinates } = this.props.searchState;
    if (searchCoordinates) {
      const { longitude, latitude } = JSON.parse(decodeURI(searchCoordinates));

      const viewer = await this.props.dispatch(
        handleGetViewerImageAction(longitude, latitude)
      );

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
  }

  render() {
    const { viewer, searchCoordinates } = this.props.searchState;
    if (viewer.key && searchCoordinates) {
      return <div className="map-viewer" id="mly"></div>;
    }
    return null;
  }
}

MapViewer.propTypes = {
  searchState: PropTypes.shape({
    viewer: PropTypes.shape({ key: PropTypes.string.isRequired }.isRequired),
    searchCoordinates: PropTypes.oneOf([null, string]).isRequired,
  }).isRequired,
};

export default MapViewer;
