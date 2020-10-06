import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { createMapParams } from "../../utils/parseURL";
import { getMapParamsAction } from "../../actions/mapState";
import PraxisMap from "./Map";

class MapContainer extends Component {
  // zipcodeFillLayer = {
  //   id: "zicode-fill",
  //   type: "fill",
  //   source: {
  //     type: "geojson",
  //     data: this.props.mapData,
  //   },
  // };

  // zipcodeLineLayer = {
  //   id: "zicode-fill",
  //   type: "line",
  //   source: {
  //     type: "geojson",
  //     data: this.props.mapData,
  //   },
  // };

  componentDidMount() {
    // parse URL and dispatch params
    const { search, pathname } = this.props.location;
    const mapParams = createMapParams(search, pathname);
    this.props.dispatch(getMapParamsAction(mapParams));
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
