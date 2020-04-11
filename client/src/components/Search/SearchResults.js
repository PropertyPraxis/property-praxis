import React, { Component } from "react";
import { Link } from "react-router-dom";
import { createNewViewport } from "../../utils/map";
import { getMapStateAction } from "../../actions/mapState";
import {
  handleSearchPartialZipcode,
  handleSearchPartialAddress,
  handleSearchPartialSpeculator,
  handleSearchFullZipcode,
  resetSearch,
  setSearchDisplayType,
  setSearchType
} from "../../actions/search";
import {
  handleGetParcelsByQueryAction,
  setMarkerCoordsAction,
  dataIsLoadingAction
} from "../../actions/mapData";
import {
  handleGetViewerImageAction,
  togglePartialResultsAction,
  toggleFullResultsAction,
  handleGetDownloadDataAction
} from "../../actions/results";
import { capitalizeFirstLetter } from "../../utils/helper";
import * as zipcodeIcon from "../../assets/img/zipcode-icon-transparent.png";
import * as speculatorIcon from "../../assets/img/speculator-icon-transparent.png";
import * as mapMarkerIcon from "../../assets/img/map-marker-transparent.png";
import "../../scss/Search.scss";

const PartialReturnResultSwitch = props => {
  const { searchType, partialResults } = props.searchState;
  switch (searchType) {
    case "All":
      return <PartialAllResults {...props} />;
    case "Address":
      return (
        <PartialAddressResults
          {...props}
          partialSearchResults={partialResults}
        />
      );
    case "Speculator":
      return (
        <PartialSpeculatorResults
          {...props}
          partialSearchResults={partialResults}
        />
      );
    case "Zipcode":
      return (
        <PartialZipcodeResults
          {...props}
          partialSearchResults={partialResults}
        />
      );
    default:
      return null;
  }
};

class PartialZipcodeResults extends Component {
  _onResultClick = result => {
    const { year } = this.props.mapData;
    //trigger data loading
    this.props.dispatch(dataIsLoadingAction(true));

    // change the partial results
    this.props.dispatch(handleSearchPartialZipcode(result.propzip, year));

    this.props.dispatch(handleSearchFullZipcode(result.propzip, year));
    // the route to parcels in zip
    const geoJsonRoute = `/api/geojson/parcels/zipcode/${result.propzip}/${year}`;
    //set map data and then create viewport
    this.props
      .dispatch(handleGetParcelsByQueryAction(geoJsonRoute))
      .then(geojson => {
        //trigger new viewport pass down from PartialSearchResults
        this.props.createNewViewport(geojson);

        //trigger data loading off
        this.props.dispatch(dataIsLoadingAction(false));
      });
    //fill in the text input
    // this.props.dispatch(setSearchTerm(result.propzip));
    this.props.dispatch(
      resetSearch({
        searchTerm: result.propzip
      })
    );
    // set the display type to full
    this.props.dispatch(setSearchDisplayType("full-zipcode"));

    //close the partial results after
    this.props.togglePartialResults(false);

    // trigger the dowload data action
    const downloadDataRoute = `/api/zipcode-search/download/${result.propzip}/${year}`;
    this.props.dispatch(handleGetDownloadDataAction(downloadDataRoute));

    //toggle the results pane
    this.props.dispatch(toggleFullResultsAction(true));
  };

  render() {
    // const { partialResults } = this.props.searchState;
    const { partialSearchResults } = this.props;
    const { year } = this.props.mapData;
    return (
      <section>
        <div className="partial-results-container">
          {partialSearchResults.map((result, index) => {
            return (
              <Link
                key={result.propzip}
                to={{
                  pathname: "/zipcode",
                  search: `search=${result.propzip}&year=${year}`
                }}
                onClick={() => {
                  this._onResultClick(result);
                }}
              >
                <div className={index % 2 ? "list-item-odd" : "list-item-even"}>
                  <img src={zipcodeIcon} alt="Zipcode Result" />{" "}
                  {result.propzip}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    );
  }
}

class PartialAddressResults extends Component {
  _onResultClick = result => {
    const { year } = this.props.mapData;
    const [longitude, latitude] = result.geometry.coordinates;
    const encodedCoords = encodeURI(JSON.stringify({ longitude, latitude }));
    //trigger data loading
    this.props.dispatch(dataIsLoadingAction(true));

    // change the partial results
    this.props.dispatch(handleSearchPartialAddress(result.place_name, year));

    //add a point marker
    this.props.dispatch(setMarkerCoordsAction(latitude, longitude));

    // get the download data for coords
    const downloadRoute = `/api/address-search/download/${encodedCoords}/${year}`;
    this.props.dispatch(handleGetDownloadDataAction(downloadRoute));

    //set new viewer in results
    this.props.dispatch(handleGetViewerImageAction(longitude, latitude));

    //set map data and then create viewport
    const geojsonRoute = `/api/geojson/parcels/address/${encodedCoords}/${year}`;
    this.props
      .dispatch(handleGetParcelsByQueryAction(geojsonRoute))
      .then(geojson => {

        if (
          geojson.features &&
          geojson.features.length === 1 &&
          geojson.features[0].properties.distance === 0
        ) {
          this.props.dispatch(
            resetSearch({
              searchTerm: result.place_name,
              searchType: "Address",
              searchDisplayType: "single-address"
            })
          );
        }

        /////
        if (geojson.features && geojson.features.length > 1) {
          this.props.dispatch(
            resetSearch({
              searchTerm: result.place_name,
              searchType: "Address",
              searchDisplayType: "multiple-parcels"
            })
          );
        }
        //trigger new viewport pass down from PartialSearchResults
        this.props.createNewViewport(geojson);
        //trigger data loading off
        this.props.dispatch(dataIsLoadingAction(false));
      });

    this.props.dispatch(toggleFullResultsAction(true));
    this.props.togglePartialResults(false);
  };

  render() {
    const { partialSearchResults } = this.props;
    const { year } = this.props.mapData;
    return (
      <section>
        <div className="partial-results-container">
          {partialSearchResults[0].mb.map((result, index) => {
            const [longitude, latitude] = result.geometry.coordinates;
            const encodedCoords = encodeURI(
              JSON.stringify({ longitude, latitude })
            );
            return (
              <Link
                key={result.place_name}
                to={{
                  pathname: "/address",
                  search: `search=${result.place_name}&coordinates=${encodedCoords}&year=${year}`
                }}
                className={index % 2 ? "list-item-odd" : "list-item-even"}
                onClick={() => {
                  this._onResultClick(result);
                }}
              >
                <div>
                  <img src={mapMarkerIcon} alt="Address Result" />
                  {result.place_name}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    );
  }
}

class PartialSpeculatorResults extends Component {
  _onResultClick = result => {
    const { year } = this.props.mapData;
    
    // const { mapState } = this.props;
    //trigger data loading
    this.props.dispatch(dataIsLoadingAction(true));

    // change the partial results
    this.props.dispatch(handleSearchPartialSpeculator(result.own_id, year));

    // trigger the dowload data action
    const downloadDataRoute = `/api/speculator-search/download/${result.own_id}/${year}`;
    this.props.dispatch(handleGetDownloadDataAction(downloadDataRoute));

    // the route to parcels in zip
    const geoJsonRoute = `/api/geojson/parcels/speculator/${result.own_id}/${year}`;
    //set map data and then create viewport
    this.props
      .dispatch(handleGetParcelsByQueryAction(geoJsonRoute))
      .then(geojson => {
        //trigger new viewport
        //Note this is creating a default because it is a point
        this.props.createNewViewport(geojson);

        //trigger data loading off
        this.props.dispatch(dataIsLoadingAction(false));
      });
    //fill in the text input
    // this.props.dispatch(setSearchTerm(result.propzip));
    this.props.dispatch(
      resetSearch({
        searchTerm: result.own_id
      })
    );

    this.props.dispatch(setSearchType("Speculator"));
    // set the display type to full
    this.props.dispatch(setSearchDisplayType("full-speculator"));
    //toggle the results pane
    this.props.dispatch(toggleFullResultsAction(true));
    //close the partial results after
    this.props.dispatch(togglePartialResultsAction(false));
  };

  render() {
    const { partialSearchResults } = this.props;
    const { year } = this.props.mapData;
    return (
      <section>
        <div className="partial-results-container">
          {partialSearchResults.map((result, index) => {
            return (
              <Link
                key={index}
                to={{
                  pathname: "/speculator",
                  search: `search=${result.own_id}&year=${year}`
                }}
                onClick={() => {
                  this._onResultClick(result);
                }}
              >
                <div className={index % 2 ? "list-item-odd" : "list-item-even"}>
                  <img src={speculatorIcon} alt="Speculator Result" />
                  {capitalizeFirstLetter(result.own_id)}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    );
  }
}

class PartialAllResults extends Component {
  render() {
    const { partialResults } = this.props.searchState;
    return (
      <div className="partial-results-container-all">
        {partialResults[0].length > 0 && partialResults[0][0].mb.length > 0 ? (
          <div className="partial-results-all-title">Address Results</div>
        ) : null}
        {partialResults[0].length > 0 &&
        partialResults[0][0].mb !== undefined ? (
          <PartialAddressResults
            {...this.props}
            partialSearchResults={partialResults[0]}
          />
        ) : null}
        {partialResults[1].length > 0 ? (
          <div className="partial-results-all-title">Speculator Results</div>
        ) : null}

        <PartialSpeculatorResults
          {...this.props}
          partialSearchResults={partialResults[1]}
        />

        {partialResults[2].length > 0 ? (
          <div className="partial-results-all-title">Zipcodes Results</div>
        ) : null}
        <PartialZipcodeResults
          {...this.props}
          partialSearchResults={partialResults[2]}
        />
      </div>
    );
  }
}

class PartialSearchResults extends Component {
  // when user clicks on a result the partial results disappear
  _togglePartialResults = isOpen => {
    this.props.dispatch(togglePartialResultsAction(isOpen));
  };

  _createNewViewport = geojson => {
    const { mapState } = this.props;
    //trigger new viewport
    const { longitude, latitude, zoom } = createNewViewport(geojson, mapState);
    this.props.dispatch(
      getMapStateAction({
        ...mapState,
        longitude,
        latitude,
        zoom,
        transitionDuration: 1000
      })
    );
  };

  render() {
    const resultLength = this.props.searchState.partialResults.length;
    const { isPartialResultsOpen } = this.props.results;

    if (resultLength > 0 && isPartialResultsOpen) {
      return (
        <PartialReturnResultSwitch
          {...this.props}
          createNewViewport={this._createNewViewport}
          togglePartialResults={this._togglePartialResults}
        />
      );
    }
    return null;
  }
}

export default PartialSearchResults;

// TEST ADDRESS
// 17451 ST LOUIS, Detroit, Michigan 48212
