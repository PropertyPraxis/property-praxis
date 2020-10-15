import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { parseURLParams } from "../../utils/parseURL";
import { getMapParamsAction } from "../../actions/mapState";
import { resetSearch } from "../../actions/search";
import PraxisMap from "./Map";

/*The MapContainer is responsible for passing the params to the map*/

class MapContainer extends Component {
  _setURLParams = () => {
    // parse URL and dispatch params
    const urlParams = parseURLParams(this.props.location.search);

    //add to search state
    const { type, search, coordinates, year } = urlParams;
    this.props.dispatch(
      resetSearch({
        searchType: type,
        searchTerm: search,
        searchCoordinates: coordinates,
        searchYear: year,
      })
    );
  };

  componentDidMount() {
    this._setURLParams();
  }

  async componentDidUpdate(prevProps) {
    // if the location changes, set the params
    if (this.props.location.search !== prevProps.location.search) {
      this._setURLParams();
    }
  }

  render() {
    console.log("map container props", this.props);
    const urlParams = parseURLParams(this.props.location.search);
    return <PraxisMap {...this.props} urlParams={urlParams} />;
  }
}

MapContainer.propTypes = {
  mapState: PropTypes.object.isRequired,
  mapData: PropTypes.object.isRequired,
  searchState: PropTypes.object.isRequired,
  currentFeature: PropTypes.object.isRequired,
  results: PropTypes.object.isRequired,
  controller: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  mapParams: PropTypes.object.isRequired,
};

function mapStateToProps({
  mapState,
  mapData,
  searchState,
  currentFeature,
  results,
  controller,
}) {
  return {
    mapState,
    mapData,
    searchState,
    currentFeature,
    results,
    controller,
  };
}

export default withRouter(connect(mapStateToProps)(MapContainer));
