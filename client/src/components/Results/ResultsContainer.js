import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { createNewViewport } from "../../utils/map";
import { coordsFromWKT } from "../../utils/map";
import { getMapStateAction } from "../../actions/mapState";
import {
  handleSearchPartialZipcode,
  handleSearchPartialAddress,
  handleSearchPartialSpeculator,
  handleSearchFullZipcode,
  handleSearchFullSpeculator,
  handleSearchFullAddress,
  resetSearch,
  setSearchType,
  setSearchDisplayType,
  setSearchTerm
} from "../../actions/search";
import {
  handleGetParcelsByQueryAction,
  setMarkerCoordsAction
} from "../../actions/mapData";
import {
  handleGetViewerImageAction,
  toggleFullResultsAction,
  togglePartialResultsAction
} from "../../actions/results";
import MapViewer from "./MapViewer";
import * as mapMarkerIcon from "../../assets/img/map-marker-transparent.png";
import "../../scss/Results.scss";

const ZipcodeFullResults = props => {
  const { features } = props.mapData.ppraxis;
  const { year } = props.mapData;

  return (
    <section>
      <h6>
        Property Praxis identified {features.length} parcels in this zipcode
      </h6>
      <div className="partial-results-container">
        {features.map((feature, index) => {
          const { propno, propstr, propdir, propzip } = feature.properties;

          //create coords from the centroid string
          const coords = coordsFromWKT(feature.centroid);
          let latitude, longitude, encodedCoords;
          if (coords) {
            latitude = coords.latitude;
            longitude = coords.longitude;
            encodedCoords = encodeURI(JSON.stringify(coords));
          }

          //build the address string
          const addressString = `${propno} ${
            propdir !== "0" && propdir !== null ? propdir : ""
          } ${propstr}, ${propzip}`;

          //return only options that are not null
          if (coords) {
            return (
              <Link
                to={{
                  pathname: "/address",
                  search: `search=${addressString}&coordinates=${encodedCoords}`
                }}
                key={index}
                className={index % 2 ? "list-item-odd" : "list-item-even"}
                onClick={() => {
                  // change the partial results
                  props
                    .dispatch(handleSearchPartialAddress(addressString, year))
                    .then(json => {
                      // set the search term to the first result of geocoder
                      const proxySearchTerm = json[0].mb[0].place_name;
                      props.dispatch(
                        resetSearch({
                          // partialResults: [],
                          searchTerm: proxySearchTerm
                        })
                      );
                    });

                  //add a point marker
                  props.dispatch(setMarkerCoordsAction(latitude, longitude));

                  //set new viewer in results
                  props.dispatch(
                    handleGetViewerImageAction(longitude, latitude)
                  );
                  //set map data and then create viewport
                  const route = `http://localhost:5000/api/geojson/parcels/address/${encodedCoords}/${year}`;
                  props
                    .dispatch(handleGetParcelsByQueryAction(route))
                    .then(geojson => {
                      //trigger new viewport pass down from PartialSearchResults
                      props.createNewViewport(geojson);
                    });
                  //set the display type to address
                  props.dispatch(setSearchType("Address"));
                  props.dispatch(toggleFullResultsAction(false));
                  props.dispatch(setSearchDisplayType("single"));
                  props.dispatch(toggleFullResultsAction(true));

                  // //close the partial results after
                  props.dispatch(togglePartialResultsAction(false));
                }}
              >
                <div>
                  <img src={mapMarkerIcon} alt="Address Result" />
                  {addressString}
                </div>
              </Link>
            );
          }
          return null;
        })}
      </div>
    </section>
  );
};

const SingleAddressResults = props => {
  return <MapViewer {...props} />;
};

const Results = props => {
  const { searchDisplayType } = props.searchState;
  return (
    <section className="results-outer">
      <div className="results-inner">
        <div
          className="results-hamburger-button"
          onClick={() => {
            props.dispatch(toggleFullResultsAction(false));
          }}
        >
          &#9776;
        </div>
        {searchDisplayType === "single" ? (
          <SingleAddressResults {...props} />
        ) : null}
        {searchDisplayType === "full" ? (
          <ZipcodeFullResults {...props} />
        ) : null}
      </div>
    </section>
  );
};

class ResultsContainer extends Component {
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
    const { isFullResultsOpen } = this.props.results;

    if (isFullResultsOpen) {
      return (
        <CSSTransition
          in={isFullResultsOpen} //set to isOpen
          appear={true}
          timeout={300}
          classNames="results-container"
        >
          <Results
            {...this.props}
            createNewViewport={this._createNewViewport}
          />
        </CSSTransition>
      );
    }
    return null;
  }
}
function mapStateToProps({ mapData, mapState, results, searchState }) {
  return { mapData, mapState, results, searchState };
}
export default connect(mapStateToProps)(ResultsContainer);
//
