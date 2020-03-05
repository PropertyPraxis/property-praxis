import React, { Component } from "react";
import { connect } from "react-redux";
import PraxisMap from "./Map";

//this token needs to be hidden
// const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

class MapContainer extends Component {
  zipcodeFillLayer = {
    id: "zicode-fill",
    type: "fill",
    source: {
      type: "geojson",
      data: this.props.mapData
    }
  };

  zipcodeLineLayer = {
    id: "zicode-fill",
    type: "line",
    source: {
      type: "geojson",
      data: this.props.mapData
    }
  };

  render() {
    return <PraxisMap {...this.props} />;
  }
}
function mapStateToProps({ mapState, mapData, currentFeature }) {
  return { mapState, mapData, currentFeature };
}
export default connect(mapStateToProps)(MapContainer);
