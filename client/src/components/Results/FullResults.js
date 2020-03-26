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
import * as infoIcon from "../../assets/img/info-icon.png";
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
                            searchTerm: proxySearchTerm
                          })
                        );
                      });

                    //add a point marker
                    this.props.dispatch(
                      setMarkerCoordsAction(latitude, longitude)
                    );

                    // get the download data for coords
                    const downloadRoute = `/api/address-search/download/${encodedCoords}/${year}`;
                    this.props.dispatch(
                      handleGetDownloadDataAction(downloadRoute)
                    );

                    //set new viewer in results
                    this.props.dispatch(
                      handleGetViewerImageAction(longitude, latitude)
                    );
                    //set map data and then create viewport
                    const geojsonRoute = `http://localhost:5000/api/geojson/parcels/address/${encodedCoords}/${year}`;
                    this.props
                      .dispatch(handleGetParcelsByQueryAction(geojsonRoute))
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
      </div>
    );
  }
}
class SingleAddressResults extends Component {
  _onZipcodeClick = () => {
    const { features } = this.props.mapData.ppraxis;
    const { year } = this.props.mapData;
    const { propzip } = features[0].properties;

    // change the partial results
    this.props.dispatch(handleSearchPartialZipcode(propzip, year));

    //trigger data loading
    this.props.dispatch(dataIsLoadingAction(true));
    // the route to parcels in zip
    const geoJsonRoute = `/api/geojson/parcels/zipcode/${propzip}/${year}`;
    //set map data and then create viewport
    this.props
      .dispatch(handleGetParcelsByQueryAction(geoJsonRoute))
      .then(geojson => {
        //trigger new viewport pass down from PartialSearchResults
        this.props.createNewViewport(geojson);
        //fill in the text input
        this.props.dispatch(setSearchType("Zipcode"));
        this.props.dispatch(
          resetSearch({
            searchTerm: propzip
          })
        );
        // set the display type to full
        this.props.dispatch(setSearchDisplayType("full-zipcode"));

        //close the partial results after
        this.props.dispatch(togglePartialResultsAction(false));

        // trigger the dowload data action
        const downloadDataRoute = `/api/zipcode-search/download/${propzip}/${year}`;
        this.props.dispatch(handleGetDownloadDataAction(downloadDataRoute));

        //toggle the results pane
        this.props.dispatch(toggleFullResultsAction(true));
        //trigger data loading off
        this.props.dispatch(dataIsLoadingAction(false));
      });
  };

  _onSpeculatorClick = () => {
    const { features } = this.props.mapData.ppraxis;
    const { year } = this.props.mapData;
    const { own_id } = features[0].properties;
    // change the partial results
    this.props.dispatch(handleSearchPartialSpeculator(own_id, year));
    // this.props.dispatch(handleSearchFullSpeculator(own_id, year));

    //set loading
    this.props.dispatch(dataIsLoadingAction(true));

    // the route to parcels in zip
    const geojsonRoute = `/api/geojson/parcels/speculator/${own_id}/${year}`;
    //set map data and then create viewport
    this.props
      .dispatch(handleGetParcelsByQueryAction(geojsonRoute))
      .then(geojson => {
        //trigger new viewport
        //Note this is creating a default because it is a point
        this.props.createNewViewport(geojson);
        //fill in the text input
        this.props.dispatch(setSearchType("Speculator"));
        this.props.dispatch(
          resetSearch({
            searchTerm: own_id
          })
        );
        // set the display type to full
        this.props.dispatch(setSearchDisplayType("full-speculator"));

        //close the partial results after
        this.props.dispatch(togglePartialResultsAction(false));

        // trigger the dowload data action
        const downloadDataRoute = `/api/speculator-search/download/${own_id}/${year}`;
        this.props.dispatch(handleGetDownloadDataAction(downloadDataRoute));

        //toggle the results pane
        this.props.dispatch(toggleFullResultsAction(true));
        //trigger data loading off
        this.props.dispatch(dataIsLoadingAction(false));
      });
  };

  render() {
    // const SingleAddressResults = props => {
    const { features } = this.props.mapData.ppraxis;
    let { searchTerm } = this.props.searchState;
    // const { targetAddress, nearbyAddresses } = findTargetAddress(features);
    // if (searchTerm === null) searchTerm = ",";
    if (features.length > 0 && features[0].properties.distance === 0) {
      /// all the properties of address
      const {
        count,
        own_id,
        parcelno,
        resyrbuilt,
        saledate,
        saleprice,
        taxpayer1,
        totacres,
        totsqft
      } = features[0].properties;

      const addressList = searchTerm.split(", ");
      const addressContext = addressList
        .slice(1, addressList.length - 1)
        .join(", ");

      return (
        <div>
          <MapViewer {...this.props} />
          <div className="address-title">
            <span>
              <img src={mapMarkerIcon} alt="Address Result" />
              {addressList[0]}
            </span>
          </div>
          <span
            className="address-context"
            onClick={() => {
              this._onZipcodeClick();
            }}
          >
            {addressContext}
            <img src={infoIcon} alt="More Information"></img>
          </span>
          <hr></hr>
          <div className="address-properties">
            <div
              onClick={() => {
                this._onSpeculatorClick();
              }}
            >
              Speculator:
              <span>
                {capitalizeFirstLetter(own_id)}
                <img src={infoIcon} alt="More Information"></img>
              </span>
            </div>

            <div>
              Properties owned: <span>{count}</span>
            </div>
            <div>
              Parcel Number: <span>{parcelno}</span>
            </div>
            {resyrbuilt === 0 || resyrbuilt === null ? null : (
              <div>
                Year built: <span>{resyrbuilt}</span>
              </div>
            )}
            <div>
              Last sale date: <span>{saledate}</span>
            </div>
            <div>
              Last sale price: <span>{saleprice}</span>
            </div>
            <div>
              Associated taxpayer: <span>{taxpayer1}</span>
            </div>
            <div>
              Square footage: <span>{totsqft}</span>
            </div>
            <div>
              Acres: <span>{totacres}</span>
            </div>
          </div>
        </div>
      );
    }
    return <div>No PP listing for this address</div>;
  }
}

class FullResults extends Component {
  render() {
    const { searchTerm, searchType } = this.props.searchState;
    const { dataIsLoading } = this.props.mapData;
    const { downloadData } = this.props.results;

    const filename = `${searchType}_${capitalizeFirstLetter(
      searchTerm
    )}_${new Date().toLocaleDateString()}.csv`
      .split(" ")
      .join("_")
      .replace(/\//g, "_")
      .replace(/,/g, "");
    console.log("filename: ", filename);
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
