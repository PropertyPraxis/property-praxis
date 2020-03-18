// import { CSSTransition } from "react-transition-group";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { createNewViewport } from "../../utils/map";
import { getMapStateAction } from "../../actions/mapState";
import {
  handleSearchFullZipcode,
  handleSearchFullSpeculator,
  handleSearchFullAddress,
  resetSearch,
  setSearchDisplayType
} from "../../actions/search";
import {
  handleGetParcelsByQueryAction,
  setMarkerCoordsAction
} from "../../actions/mapData";
import { handleGetViewerImageAction } from "../../actions/results";
import * as zipcodeIcon from "../../assets/img/zipcode-icon-transparent.png";
import * as speculatorIcon from "../../assets/img/speculator-icon-transparent.png";
import * as mapMarkerIcon from "../../assets/img/map-marker-transparent.png";
import "../../scss/Search.scss";

// use this object to reset to nothing

const PartialReturnResultSwitch = props => {
  const { searchType } = props.searchState;
  switch (searchType) {
    case "All":
      return null;
    case "Address":
      return <PartialAddressResults {...props} />;
    case "Speculator":
      return <PartialSpeculatorResults {...props} />;
    case "Zipcode":
      return <PartialZipcodeResults {...props} />;
    default:
      return null;
  }
};

const PartialZipcodeResults = props => {
  const { partialResults } = props.searchState;
  const { year } = props.mapData;

  return (
    <section>
      <div className="partial-results-container">
        {partialResults.map((result, index) => {
          return (
            <Link
              key={result.propzip}
              to={{
                pathname: "/zipcode",
                search: `search=${result.propzip}`
              }}
              onClick={() => {
                props.dispatch(handleSearchFullZipcode(result.propzip, year));
                // the route to parcels in zip
                const route = `/api/geojson/parcels/zipcode/${result.propzip}/${year}`;
                //set map data and then create viewport
                props
                  .dispatch(handleGetParcelsByQueryAction(route))
                  .then(geojson => {
                    //trigger new viewport pass down from PartialSearchResults
                    props.createNewVieport(geojson);
                  });
                //fill in the text input
                // props.dispatch(setSearchTerm(result.propzip));
                props.dispatch(
                  resetSearch({
                    // partialResults: [],
                    searchTerm: result.propzip
                  })
                );
                // set the display type to full
                props.dispatch(setSearchDisplayType("full"));
              }}
            >
              <div className={index % 2 ? "list-item-odd" : "list-item-even"}>
                <img src={zipcodeIcon} alt="Zipcode Result" /> {result.propzip}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

const FullZipcodeResults = props => {
  const { fullResults } = props.searchState;

  return (
    <section>
      <div className="full-results-container">
        <div></div>
      </div>
    </section>
  );
};

const PartialAddressResults = props => {
  const { partialResults } = props.searchState;
  const { year } = props.mapData;
  return (
    <section>
      <div className="partial-results-container">
        {partialResults[0].mb.map((result, index) => {
          const [longitude, latitude] = result.geometry.coordinates;
          const coords = encodeURI(JSON.stringify({ longitude, latitude }));
          return (
            <Link
              key={result.place_name}
              to={{
                pathname: "/address",
                search: `search=${result.place_name}&coordinates=${coords}`
              }}
              className={index % 2 ? "list-item-odd" : "list-item-even"}
              onClick={() => {
                //add a point marker
                props.dispatch(setMarkerCoordsAction(latitude, longitude));
                props.createNewVieport(result);
                props.dispatch(handleSearchFullAddress(coords, year));
                
                //set new viewer in results
                props.dispatch(handleGetViewerImageAction(longitude, latitude));
                //set map data and then create viewport
                const route = `http://localhost:5000/api/geojson/parcels/address/${coords}/${year}`;
                props
                  .dispatch(handleGetParcelsByQueryAction(route))
                  .then(geojson => {
                    //trigger new viewport pass down from PartialSearchResults
                    // props.createNewVieport(geojson);
                  });
                //fill in the text input
                // props.dispatch(setSearchTerm(result.propzip));
                props.dispatch(
                  resetSearch({
                    // partialResults: [],
                    searchTerm: result.place_name
                  })
                );
                // set the display type to full
                props.dispatch(setSearchDisplayType("full"));
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
};

const PartialSpeculatorResults = props => {
  const { partialResults } = props.searchState;
  const { year } = props.mapData;
  const { mapState } = props;
  return (
    <section>
      <div className="partial-results-container">
        {partialResults.map((result, index) => {
          return (
            <Link
              key={result.propzip}
              to={{
                pathname: "/speculator",
                search: `search=${result.own_id}`
              }}
              onClick={() => {
                props.dispatch(handleSearchFullSpeculator(result.own_id, year));
                // the route to parcels in zip
                const route = `/api/geojson/parcels/speculator/${result.own_id}/${year}`;
                //set map data and then create viewport
                props
                  .dispatch(handleGetParcelsByQueryAction(route))
                  .then(geojson => {
                    //trigger new viewport
                    //Note this is creating a default because it is a point
                    props.createNewVieport(geojson);
                  });
                //fill in the text input
                // props.dispatch(setSearchTerm(result.propzip));
                props.dispatch(
                  resetSearch({
                    // partialResults: [],
                    searchTerm: result.own_id
                  })
                );
                // set the display type to full
                props.dispatch(setSearchDisplayType("full"));
              }}
            >
              <div className={index % 2 ? "list-item-odd" : "list-item-even"}>
                <img src={speculatorIcon} alt="Speculator Result" />
                {result.own_id}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

class PartialSearchResults extends Component {
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

    if (resultLength > 0) {
      return (
        <PartialReturnResultSwitch
          {...this.props}
          createNewVieport={this._createNewViewport}
        />
      );
    }
    return null;
  }
}

export default PartialSearchResults;

// TEST ADDRESS
// 17451 ST LOUIS, Detroit, Michigan 48212
