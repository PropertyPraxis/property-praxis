import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { CSVLink, CSVDownload } from "react-csv";
import { coordsFromWKT } from "../../utils/map";
import {
  findTargetAddress,
  createAddressString,
  capitalizeFirstLetter
} from "../../utils/helper";
import {
  handleSearchPartialZipcode,
  handleSearchPartialAddress,
  handleSearchPartialSpeculator,
  resetSearch,
  setSearchType,
  setSearchDisplayType,
  setSearchTerm
} from "../../actions/search";
import {
  handleGetParcelsByQueryAction,
  setMarkerCoordsAction,
  dataIsLoadingAction
} from "../../actions/mapData";
import {
  handleGetViewerImageAction,
  toggleFullResultsAction,
  togglePartialResultsAction,
  handleGetDownloadDataAction
} from "../../actions/results";
import MapViewer from "./MapViewer";
import DownloadData from "../Download/DownloadData";
import * as mapMarkerIcon from "../../assets/img/map-marker-transparent.png";
import * as downloadIcon from "../../assets/img/download-icon.png";
import "../../scss/Results.scss";

const ResultsSwitcher = props => {
  const { searchDisplayType } = props.searchState;
  const { dataIsLoading } = props.mapData;

  return searchDisplayType === "full-zipcode" && !dataIsLoading ? (
    <ParcelResults {...props} resultsType="zipcode-results" />
  ) : searchDisplayType === "full-speculator" && !dataIsLoading ? (
    <ParcelResults {...props} resultsType="speculator-results" />
  ) : searchDisplayType === "single-address" && !dataIsLoading ? (
    <SingleAddressResults {...props} />
  ) : (
    "LOADING..."
  );
};

//currently this works for zipcodes
// props for this will be:
// resultsType zipcode-results, speculator-results
class ParcelResults extends Component {
  render() {
    const { features } = this.props.mapData.ppraxis;
    const { year } = this.props.mapData;
    const { searchTerm } = this.props.searchState;
    const { resultsType } = this.props;
    const { downloadData } = this.props.results;
    return (
      <div>
        <div className="results-title">
          <span className="number-circle">{features.length}</span>
          {resultsType === "zipcode-results"
            ? " properties listed in"
            : resultsType === "speculator-results"
            ? " properties owned by"
            : null}
          <span> {capitalizeFirstLetter(searchTerm)}</span>
        </div>

        <div className="partial-results-container partial-results-mobile">
          {features.map((feature, index) => {
            const { propno, propstr, propdir, propzip } = feature.properties;

            //create coords from the centroid string
            const coords = coordsFromWKT(feature.centroid);

            //return only options that are not null
            if (coords) {
              const latitude = coords.latitude;
              const longitude = coords.longitude;
              const encodedCoords = encodeURI(JSON.stringify(coords));

              //build the address string
              const addressString = createAddressString(
                propno,
                propdir,
                propstr,
                propzip
              );
              return (
                <Link
                  to={{
                    pathname: "/address",
                    search: `search=${addressString}&coordinates=${encodedCoords}`
                  }}
                  key={index}
                  className={index % 2 ? "list-item-odd" : "list-item-even"}
                  onClick={() => {
                    this.props.dispatch(dataIsLoadingAction(true));

                    // change the partial results
                    this.props
                      .dispatch(handleSearchPartialAddress(addressString, year))
                      .then(json => {
                        // set the search term to the first result of geocoder
                        const proxySearchTerm = json[0].mb[0].place_name;
                        this.props.dispatch(
                          resetSearch({
                            // partialResults: [],
                            searchTerm: proxySearchTerm
                          })
                        );
                      });

                    //add a point marker
                    this.props.dispatch(
                      setMarkerCoordsAction(latitude, longitude)
                    );

                    //set new viewer in results
                    console.log("Parcel Results");
                    this.props.dispatch(
                      handleGetViewerImageAction(longitude, latitude)
                    );
                    //set map data and then create viewport
                    const route = `http://localhost:5000/api/geojson/parcels/address/${encodedCoords}/${year}`;
                    this.props
                      .dispatch(handleGetParcelsByQueryAction(route))
                      .then(geojson => {
                        //trigger new viewport pass down from PartialSearchResults
                        this.props.createNewViewport(geojson);
                        //loading
                        this.props.dispatch(dataIsLoadingAction(false));
                      });

                    //set the display type to address
                    this.props.dispatch(setSearchType("Address"));
                    this.props.dispatch(setSearchDisplayType("single-address"));
                    this.props.dispatch(toggleFullResultsAction(true));
                    // //close the partial results after
                    this.props.dispatch(togglePartialResultsAction(false));
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
        {/* {downloadData ? (
          <CSVLink data={downloadData}>
            <div className="download-button">Download me</div>
          </CSVLink>
        ) : null} */}
      </div>
    );
  }
}

const SingleAddressResults = props => {
  const { features } = props.mapData.ppraxis;
  const { searchTerm } = props.searchState;
  const { targetAddress, nearbyAddresses } = findTargetAddress(features);

  let addressList;
  let addressContext;
  if (targetAddress) {
    addressList = searchTerm.split(", ");
    addressContext = addressList.slice(1, addressList.length - 1).join(", ");
  }
  return (
    <div>
      <MapViewer {...props} />
      {targetAddress.length > 0 ? (
        <div>
          <div className="address-title">
            <span>
              <img src={mapMarkerIcon} alt="Address Result" />
              {addressList[0]}
            </span>
          </div>
          <span className="address-context">{addressContext}</span>
          <hr></hr>
          {/* <ParcelResults {...props} title="" /> */}
        </div>
      ) : (
        <div>No PP listing for this address</div>
      )}
    </div>
  );
};

class FullResults extends Component {
  render() {
    const { searchTerm, searchType } = this.props.searchState;
    const { dataIsLoading } = this.props.mapData;
    const { downloadData } = this.props.results;

    const filename = `Property_Praxis_${searchType}_${capitalizeFirstLetter(
      searchTerm
    )}_${new Date().toLocaleDateString()}.csv`
      .split(" ")
      .join("_")
      .replace("/", "_");
    // if (downloadData) {
    return (
      <section className="results-outer">
        <div className="results-inner">
          <div
            className="results-hamburger-button"
            onClick={() => {
              this.props.dispatch(toggleFullResultsAction(false));
            }}
          >
            &#9776;
          </div>
          <ResultsSwitcher {...this.props} />
          {downloadData && !dataIsLoading ? (
            <CSVLink data={downloadData} filename={filename}>
              <div className="download-button">
                <img src={downloadIcon} alt="Download button"></img>Download
              </div>
            </CSVLink>
          ) : null}
        </div>
      </section>
    );
    // }

    // return <div className="results-outer">results outer</div>;
  }
}

export default FullResults;
