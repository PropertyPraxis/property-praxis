import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { createMapParams } from "../../utils/parseURL";
import { getMapParamsAction } from "../../actions/mapState";
import PraxisMap from "./Map";

/*The MapContainer is responsible for passing the params to the map*/

class MapContainer extends Component {
  _setMapParams = () => {
    // parse URL and dispatch params
    const { search } = this.props.location;
    const mapParams = createMapParams(search);
    this.props.dispatch(getMapParamsAction(mapParams));
  };

  componentDidMount() {
    this._setMapParams();
  }

  async componentDidUpdate(prevProps) {
    // if the location changes, set the map params
    if (this.props.location.search !== prevProps.location.search) {
      this._setMapParams();
    }
  }

  render() {
    const { params } = this.props.mapState;
    return <PraxisMap {...this.props} mapParams={params} />;
  }
}

MapContainer.propTypes = {
  mapState: PropTypes.object.isRequired,
  mapData: PropTypes.object.isRequired,
  currentFeature: PropTypes.object.isRequired,
  results: PropTypes.object.isRequired,
  controller: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  mapParams: PropTypes.object.isRequired,
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
