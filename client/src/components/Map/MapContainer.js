import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import queryString from "query-string";
import PraxisMap from "./Map";

class MapContainer extends Component {
  zipcodeFillLayer = {
    id: "zicode-fill",
    type: "fill",
    source: {
      type: "geojson",
      data: this.props.mapData,
    },
  };

  zipcodeLineLayer = {
    id: "zicode-fill",
    type: "line",
    source: {
      type: "geojson",
      data: this.props.mapData,
    },
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

MapContainer.propTypes = {
  mapState: PropTypes.object.isRequired,
  mapData: PropTypes.object.isRequired,
  currentFeature: PropTypes.object.isRequired,
  results: PropTypes.object.isRequired,
  controller: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

function mapStateToProps({
  mapState,
  mapData,
  currentFeature,
  results,
  controller,
}) {
  return { mapState, mapData, currentFeature, results, controller };
}
export default connect(mapStateToProps)(MapContainer);
