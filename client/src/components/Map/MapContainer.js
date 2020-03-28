import React, { Component } from "react";
import { connect } from "react-redux";
import queryString from "query-string";
import PraxisMap from "./Map";

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

  componentDidUpdate(prevProps) {
    const queryParams = queryString.parse(this.props.location.search);

    // Typical usage (don't forget to compare props):
    if (this.props.location.search !== prevProps.location.search) {
      console.log("location changed");
    }
  }

  render() {
    return <PraxisMap {...this.props} />;
  }
}
function mapStateToProps({
  mapState,
  mapData,
  currentFeature,
  results,
  controller
}) {
  return { mapState, mapData, currentFeature, results, controller };
}
export default connect(mapStateToProps)(MapContainer);
