import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { CSVLink } from "react-csv";
import {
  toggleDetailedResultsAction,
  updateDetailedResults,
  handleGetDownloadDataAction,
  handleGetPraxisYearsAction,
  resetSearch,
} from "../../actions/search";
// import { coordsFromWKT } from "../../utils/map";
import {
  createAddressString,
  capitalizeFirstLetter,
  createDateString,
  addUnderscoreToString,
  createQueryStringFromSearch,
  currencyFormatter,
  availablePraxisYears,
} from "../../utils/helper";
import MapViewer from "./MapViewer";
import * as mapMarkerIcon from "../../assets/img/map-marker-transparent.png";
import * as downloadIcon from "../../assets/img/download-icon.png";
import * as infoIcon from "../../assets/img/info-icon.png";

// const detailedResultsRoutes = {
//   address: `/api/address-search/full/`, // <coords>/<year>
//   speculator: `/api/speculator-search/full/`, // <id>/<year>
//   zipcode: `/api/zipcode-search/full/`, //<id>/<year>
// };

function calculateResultsType(searchType, results) {
  if (results.length === 1 && searchType === "address") {
    return "address-single";
  } else if (results.length > 1 && searchType === "address") {
    return "address-multiple";
  } else if (searchType === "speculator") {
    return "speculator-multiple";
  } else if (searchType === "zipcode") {
    return "zipcode-multiple";
  } else {
    throw new Error(`No results type found for ${searchType}.`);
  }
}

// resultsType zipcode-results, speculator-results
// class ParcelResults extends Component {
//   render() {
//     // const { features } = this.props.mapData.ppraxis;
//     // const { year } = this.props.mapData;
//     const { searchTerm, searchType } = this.props.searchState;
//     const { resultsType } = this.props;

//     return (
//       <div>
//         <div className="results-title">
//           <span className="number-circle">{features.length}</span>
//           {resultsType === "zipcode-results"
//             ? " properties in "
//             : resultsType === "speculator-results"
//             ? " properties for "
//             : resultsType === "multiple-parcels"
//             ? " properties within 1km"
//             : null}
//           <div>
//             {resultsType === "zipcode-results" ||
//             resultsType === "speculator-results"
//               ? capitalizeFirstLetter(searchTerm)
//               : null}
//           </div>
//         </div>

//         <div className="partial-results-container partial-results-mobile">
//           {features.map((feature, index) => {
//             const { propno, propstr, propdir, propzip } = feature.properties;

//             //create coords from the centroid string
//             const coords = coordsFromWKT(feature.centroid);

//             //return only options that are not null
//             if (coords) {
//               const latitude = coords.latitude;
//               const longitude = coords.longitude;
//               const encodedCoords = encodeURI(JSON.stringify(coords));

//               //build the address string
//               const addressString = createAddressString(
//                 propno,
//                 propdir,
//                 propstr,
//                 propzip
//               );
//               return (
//                 <Link
//                   to={{
//                     pathname: "/map/address",
//                     search: `search=${addressString}&coordinates=${encodedCoords}&year=${year}`,
//                   }}
//                   key={index}
//                   className={index % 2 ? "list-item-odd" : "list-item-even"}
//                   onClick={() => {
//                     // this.props.dispatch(dataIsLoadingAction(true));

//                     // change the partial results
//                     // this.props
//                     //   .dispatch(handleSearchPartialAddress(addressString, year))
//                     //   .then((json) => {
//                     //     // set the search term to the first result of geocoder
//                     //     const proxySearchTerm = json[0].mb[0].place_name;
//                     //     this.props.dispatch(
//                     //       resetSearch({
//                     //         searchTerm: proxySearchTerm,
//                     //       })
//                     //     );
//                     //   });

//                     //add a point marker
//                     this.props.dispatch(
//                       setMarkerCoordsAction(latitude, longitude)
//                     );

//                     //set new viewer in results
//                     this.props.dispatch(
//                       handleGetViewerImageAction(longitude, latitude)
//                     );
//                     //set map data and then create viewport
//                     const geojsonRoute = `/api/geojson/parcels/address/${encodedCoords}/${year}`;
//                     this.props
//                       .dispatch(handleGetParcelsByQueryAction(geojsonRoute))
//                       .then((geojson) => {
//                         //trigger new viewport pass down from PartialSearchResults
//                         this.props.createNewViewport(geojson);
//                         //loading
//                         // this.props.dispatch(dataIsLoadingAction(false));
//                       });

//                     //set the display type to address
//                     this.props.dispatch(
//                       resetSearch({
//                         searchType: "address",
//                         searchDisplayType: "single-address",
//                       })
//                     );
//                     // this.props.dispatch(setSearchDisplayType("single-address"));
//                     this.props.dispatch(toggleFullResultsAction(true));
//                     // //close the partial results after
//                     this.props.dispatch(togglePartialResultsAction(false));
//                   }}
//                 >
//                   <div>
//                     <img src={mapMarkerIcon} alt="Address Result" />
//                     {addressString}
//                   </div>
//                 </Link>
//               );
//             }
//             return null;
//           })}
//         </div>
//       </div>
//     );
//   }
// }

class AddressDetails extends Component {
  componentDidMount() {
    // when mounted calculate query all the years available
    // for these coords
    const { searchCoordinates } = this.props.searchState;
    if (searchCoordinates) {
      const route = `/api/praxisyears/address/${encodeURI(searchCoordinates)}`;
      this.props.dispatch(handleGetPraxisYearsAction(route));
    }
  }

  render() {
    const {
      searchTerm,
      searchYear,
      searchCoordinates,
      praxisSearchYears,
      isDetailedResultsOpen,
    } = this.props.searchState;
    const {
      own_id,
      resyrbuilt,
      saledate,
      saleprice,
      totsqft,
      propzip,
      propaddr,
      count,
      parcelno,
    } = this.props.result.properties;

    // other years to search for this address
    const praxisYears = availablePraxisYears(praxisSearchYears, searchYear);

    return (
      <div className="results-inner">
        <MapViewer {...this.props} />
        <div
          style={
            isDetailedResultsOpen ? { display: "block" } : { display: "none" }
          }
        >
          <div className="address-title">
            <img
              src="https://property-praxis-web.s3-us-west-2.amazonaws.com/map_marker_rose.svg"
              alt="A map marker icon"
            />
            <span>{searchTerm}</span>
          </div>
          <div className="address-properties">
            <div>
              <span>Speculator</span>
              <span>{capitalizeFirstLetter(own_id)}</span>
            </div>
            {resyrbuilt === 0 || resyrbuilt === null ? null : (
              <div>
                <span>Year Built</span> <span>{resyrbuilt}</span>
              </div>
            )}

            {saledate === 0 || saledate === null ? null : (
              <div>
                <span>Last Sale Date </span>
                <span>{saledate}</span>
              </div>
            )}

            {saleprice === null ? null : (
              <div>
                <span>Last Sale Price</span>
                <span>{currencyFormatter.format(saleprice)}</span>
              </div>
            )}
            {totsqft === null ? null : (
              <div>
                <span>Area</span>
                <span>{`${totsqft.toLocaleString()} sq. ft.`}</span>{" "}
              </div>
            )}
            {parcelno === null ? null : (
              <div>
                <span>Parcel Number</span>
                <span>{parcelno}</span>{" "}
              </div>
            )}
          </div>
          <div className="address-title">
            <img
              src="https://property-praxis-web.s3-us-west-2.amazonaws.com/question_mark_rose.svg"
              alt="A question mark icon"
            />
            <span> About the Property</span>
          </div>
          <div className="address-properties">
            <p>
              In <span>{searchYear}</span>,{" "}
              <span>{capitalizeFirstLetter(propaddr)}</span> was located in
              Detroit zipcode <span>{propzip}</span>, and was one of{" "}
              <span>{count}</span> properties owned by speculator{" "}
              <span>{capitalizeFirstLetter(own_id)}</span>. Additional years of
              speculation for this property ocurred in{" "}
              <span>{praxisYears ? praxisYears.join(", ") : null}</span>.
            </p>
            <Link
              to={createQueryStringFromSearch({
                type: "zipcode",
                search: propzip,
                coordinates: null,
                year: searchYear,
              })}
            >
              <span>
                <img src={infoIcon} alt="More Information"></img>
                {`Search additional properties in ${propzip}.`}
              </span>
            </Link>
            <Link
              to={createQueryStringFromSearch({
                type: "speculator",
                search: own_id,
                coordinates: null,
                year: searchYear,
              })}
            >
              <span>
                <img src={infoIcon} alt="More Information"></img>
                {`Search additional properties owned by ${capitalizeFirstLetter(
                  own_id
                )}.`}
              </span>
            </Link>
            {praxisYears
              ? praxisYears.map((year) => {
                  return (
                    <Link
                      to={createQueryStringFromSearch({
                        type: "address",
                        search: searchTerm,
                        coordinates: searchCoordinates,
                        year: year,
                      })}
                    >
                      <span>
                        <img src={infoIcon} alt="More Information"></img>
                        {`Search the ${year} record for this property.`}
                      </span>
                    </Link>
                  );
                })
              : null}
          </div>
        </div>
      </div>
    );
  }
}

class DetailedSearchResults extends Component {
  _toggleDetailedResultsDrawer = () => {
    const { isDetailedResultsOpen } = this.props.searchState;
    this.props.dispatch(toggleDetailedResultsAction(!isDetailedResultsOpen));
  };

  _getDetailedResultsFromGeoJSON = (details) => {
    this.props.dispatch(updateDetailedResults(details));
  };

  componentDidMount() {
    this._getDetailedResultsFromGeoJSON(this.props.details);
  }

  render() {
    const { isDetailedResultsOpen, detailedResults } = this.props.searchState;

    if (detailedResults) {
      return (
        <section className="result-drawer-static">
          <div
            className={
              isDetailedResultsOpen
                ? "results-hamburger-button drawer-open"
                : "results-hamburger-button drawer-closed"
            }
            onClick={this._toggleDetailedResultsDrawer}
          >
            &#9776;
          </div>
          <AddressDetails {...this.props} result={detailedResults[0]} />
        </section>
      );
    }
    return null; // could add loading info
  }
}

export default DetailedSearchResults;

// const ResultsSwitcher = (props) => {
//   const { searchDisplayType } = props.searchState;
//   const { dataIsLoading } = props.mapData;

//   return searchDisplayType === "full-zipcode" && !dataIsLoading ? (
//     <ParcelResults {...props} resultsType="zipcode-results" />
//   ) : searchDisplayType === "full-speculator" && !dataIsLoading ? (
//     <ParcelResults {...props} resultsType="speculator-results" />
//   ) : searchDisplayType === "multiple-parcels" && !dataIsLoading ? (
//     <ParcelResults {...props} resultsType="multiple-parcels" />
//   ) : searchDisplayType === "single-address" && !dataIsLoading ? (
//     <SingleAddressResults {...props} />
//   ) : (
//     "LOADING..."
//   );
// };

// ResultsSwitcher.propTypes = {
//   searchState: PropTypes.shape({
//     searchDisplayType: PropTypes.oneOfType([
//       PropTypes.string,
//       PropTypes.oneOf([null]),
//     ]),
//   }).isRequired,
//   mapData: PropTypes.shape({ dataIsLoading: PropTypes.bool.isRequired })
//     .isRequired,
// };

// //currently this works for zipcodes
// // resultsType zipcode-results, speculator-results
// class ParcelResults extends Component {
//   componentDidMount() {
//     const { resultsType } = this.props;
//     const { year } = this.props.mapData;
//     const { searchTerm } = this.props.searchState;
//     if (resultsType === "speculator-results") {
//       // trigger the dowload data action
//       const downloadDataRoute = `/api/speculator-search/download/${searchTerm}/${year}`;
//       this.props.dispatch(handleGetDownloadDataAction(downloadDataRoute));
//     }

//     if (resultsType === "zipcode-results") {
//       // trigger the dowload data action
//       const downloadDataRoute = `/api/zipcode-search/download/${searchTerm}/${year}`;
//       this.props.dispatch(handleGetDownloadDataAction(downloadDataRoute));
//     }
//   }

//   render() {
//     const { features } = this.props.mapData.ppraxis;
//     const { year } = this.props.mapData;
//     const { searchTerm } = this.props.searchState;
//     const { resultsType } = this.props;

//     return (
//       <div>
//         <div className="results-title">
//           <span className="number-circle">{features.length}</span>
//           {resultsType === "zipcode-results"
//             ? " properties in "
//             : resultsType === "speculator-results"
//             ? " properties for "
//             : resultsType === "multiple-parcels"
//             ? " properties within 1km"
//             : null}
//           <div>
//             {resultsType === "zipcode-results" ||
//             resultsType === "speculator-results"
//               ? capitalizeFirstLetter(searchTerm)
//               : null}
//           </div>
//         </div>

//         <div className="partial-results-container partial-results-mobile">
//           {features.map((feature, index) => {
//             const { propno, propstr, propdir, propzip } = feature.properties;

//             //create coords from the centroid string
//             const coords = coordsFromWKT(feature.centroid);

//             //return only options that are not null
//             if (coords) {
//               const latitude = coords.latitude;
//               const longitude = coords.longitude;
//               const encodedCoords = encodeURI(JSON.stringify(coords));

//               //build the address string
//               const addressString = createAddressString(
//                 propno,
//                 propdir,
//                 propstr,
//                 propzip
//               );
//               return (
//                 <Link
//                   to={{
//                     pathname: "/map/address",
//                     search: `search=${addressString}&coordinates=${encodedCoords}&year=${year}`,
//                   }}
//                   key={index}
//                   className={index % 2 ? "list-item-odd" : "list-item-even"}
//                   onClick={() => {
//                     // this.props.dispatch(dataIsLoadingAction(true));

//                     // change the partial results
//                     // this.props
//                     //   .dispatch(handleSearchPartialAddress(addressString, year))
//                     //   .then((json) => {
//                     //     // set the search term to the first result of geocoder
//                     //     const proxySearchTerm = json[0].mb[0].place_name;
//                     //     this.props.dispatch(
//                     //       resetSearch({
//                     //         searchTerm: proxySearchTerm,
//                     //       })
//                     //     );
//                     //   });

//                     //add a point marker
//                     this.props.dispatch(
//                       setMarkerCoordsAction(latitude, longitude)
//                     );

//                     //set new viewer in results
//                     this.props.dispatch(
//                       handleGetViewerImageAction(longitude, latitude)
//                     );
//                     //set map data and then create viewport
//                     const geojsonRoute = `/api/geojson/parcels/address/${encodedCoords}/${year}`;
//                     this.props
//                       .dispatch(handleGetParcelsByQueryAction(geojsonRoute))
//                       .then((geojson) => {
//                         //trigger new viewport pass down from PartialSearchResults
//                         this.props.createNewViewport(geojson);
//                         //loading
//                         // this.props.dispatch(dataIsLoadingAction(false));
//                       });

//                     //set the display type to address
//                     this.props.dispatch(
//                       resetSearch({
//                         searchType: "address",
//                         searchDisplayType: "single-address",
//                       })
//                     );
//                     // this.props.dispatch(setSearchDisplayType("single-address"));
//                     this.props.dispatch(toggleFullResultsAction(true));
//                     // //close the partial results after
//                     this.props.dispatch(togglePartialResultsAction(false));
//                   }}
//                 >
//                   <div>
//                     <img src={mapMarkerIcon} alt="Address Result" />
//                     {addressString}
//                   </div>
//                 </Link>
//               );
//             }
//             return null;
//           })}
//         </div>
//       </div>
//     );
//   }
// }

// ParcelResults.propTypes = {
//   mapData: PropTypes.shape({
//     year: PropTypes.string.isRequired,
//     ppraxis: PropTypes.object.isRequired,
//   }).isRequired,
//   searchState: PropTypes.shape({
//     searchTerm: PropTypes.string.isRequired,
//   }).isRequired,
//   resultsType: PropTypes.string.isRequired,
//   dispatch: PropTypes.func.isRequired,
// };

// class SingleAddressResults extends Component {
//   componentDidMount() {
//     // get the download data for coords
//     const { year } = this.props.mapData;
//     const { centroid } = this.props.mapData.ppraxis.features[0];
//     const coords = coordsFromWKT(centroid);
//     const encodedCoords = encodeURI(JSON.stringify(coords));
//     const downloadRoute = `/api/address-search/download/${encodedCoords}/${year}`;
//     this.props.dispatch(handleGetDownloadDataAction(downloadRoute));
//   }

//   _onZipcodeClick = () => {
//     const { features } = this.props.mapData.ppraxis;
//     const { year } = this.props.mapData;
//     const { propzip } = features[0].properties;

//     //set any marker to null
//     this.props.dispatch(setMarkerCoordsAction(null, null));

//     // change the partial results
//     // this.props.dispatch(handleSearchPartialZipcode(propzip, year));

//     //trigger data loading
//     // this.props.dispatch(dataIsLoadingAction(true));
//     // the route to parcels in zip
//     const geoJsonRoute = `/api/geojson/parcels/zipcode/${propzip}/${year}`;
//     //set map data and then create viewport
//     this.props
//       .dispatch(handleGetParcelsByQueryAction(geoJsonRoute))
//       .then((geojson) => {
//         //trigger new viewport pass down from PartialSearchResults
//         this.props.createNewViewport(geojson);
//         //fill in the text input
//         this.props.dispatch(
//           resetSearch({
//             searchTerm: propzip,
//             searchType: "Zipcode",
//             searchDisplayType: "full-zipcode",
//           })
//         );

//         //close the partial results after
//         this.props.dispatch(togglePartialResultsAction(false));

//         //toggle the results pane
//         this.props.dispatch(toggleFullResultsAction(true));
//         //trigger data loading off
//         // this.props.dispatch(dataIsLoadingAction(false));

//         //change the url
//         const state = null;
//         const title = "";
//         const newUrl = `/map/zipcode?search=${propzip}&year=${year}`;

//         //change the url
//         window.history.pushState(state, title, newUrl);
//       });
//   };

//   _onSpeculatorClick = () => {
//     const { features } = this.props.mapData.ppraxis;
//     const { year } = this.props.mapData;
//     const { own_id } = features[0].properties;

//     //set any marker to null
//     this.props.dispatch(setMarkerCoordsAction(null, null));

//     // change the partial results
//     // this.props.dispatch(handleSearchPartialSpeculator(own_id, year));

//     //set loading
//     // this.props.dispatch(dataIsLoadingAction(true));

//     // the route to parcels in zip
//     const geojsonRoute = `/api/geojson/parcels/speculator/${own_id}/${year}`;
//     //set map data and then create viewport
//     this.props
//       .dispatch(handleGetParcelsByQueryAction(geojsonRoute))
//       .then((geojson) => {
//         //trigger new viewport
//         //Note this is creating a default because it is a point
//         this.props.createNewViewport(geojson);
//         //fill in the text input
//         this.props.dispatch(
//           resetSearch({
//             searchTerm: own_id,
//             searchType: "Speculator",
//             searchDisplayType: "full-speculator",
//           })
//         );
//         //close the partial results after
//         this.props.dispatch(togglePartialResultsAction(false));

//         //toggle the results pane
//         this.props.dispatch(toggleFullResultsAction(true));
//         //trigger data loading off
//         // this.props.dispatch(dataIsLoadingAction(false));

//         //change the url
//         const state = null;
//         const title = "";
//         const newUrl = `/map/speculator?search=${own_id}&year=${year}`;

//         //change the url
//         window.history.pushState(state, title, newUrl);
//       });
//   };

//   render() {
//     const { features } = this.props.mapData.ppraxis;
//     let { searchTerm } = this.props.searchState;
//     if (features.length > 0 && features[0].properties.distance === 0) {
//       /// all the properties of address
//       const {
//         count,
//         own_id,
//         parcelno,
//         resyrbuilt,
//         saledate,
//         saleprice,
//         taxpayer1,
//         totacres,
//         totsqft,
//       } = features[0].properties;

//       //this logic can move to utils
//       const addressList = searchTerm.split(", ");
//       let addressContext;
//       if (addressList.length > 2) {
//         addressContext = addressList
//           .slice(1, addressList.length - 1)
//           .join(", ");
//       } else {
//         addressContext = addressList[1];
//       }

//       return (
//         <div>
//           <MapViewer {...this.props} />
//           <div className="address-title">
//             <span>
//               <img src={mapMarkerIcon} alt="Address Result" />
//               {addressList[0]}
//             </span>
//           </div>
//           <span
//             className="address-context"
//             onClick={() => {
//               this._onZipcodeClick();
//             }}
//           >
//             {addressContext}
//             <img src={infoIcon} alt="More Information"></img>
//           </span>
//           <hr></hr>
//           <div className="address-properties">
//             <div
//               onClick={() => {
//                 this._onSpeculatorClick();
//               }}
//             >
//               Speculator:
//               <span>
//                 {capitalizeFirstLetter(own_id)}
//                 <img src={infoIcon} alt="More Information"></img>
//               </span>
//             </div>

//             <div>
//               Properties owned: <span>{count}</span>
//             </div>
//             <div>
//               Parcel Number: <span>{parcelno}</span>
//             </div>
//             {resyrbuilt === 0 || resyrbuilt === null ? null : (
//               <div>
//                 Year built: <span>{resyrbuilt}</span>
//               </div>
//             )}
//             <div>
//               Last sale date: <span>{saledate}</span>
//             </div>
//             <div>
//               Last sale price: <span>{saleprice}</span>
//             </div>
//             <div>
//               Associated taxpayer: <span>{taxpayer1}</span>
//             </div>
//             <div>
//               Square footage: <span>{totsqft}</span>
//             </div>
//             <div>
//               Acres: <span>{totacres}</span>
//             </div>
//           </div>
//         </div>
//       );
//     }
//     return <div>LOADING...</div>;
//   }
// }

// SingleAddressResults.propTypes = {
//   mapData: PropTypes.shape({
//     year: PropTypes.string.isRequired,
//     ppraxis: PropTypes.object.isRequired,
//   }).isRequired,
//   searchState: PropTypes.shape({
//     searchTerm: PropTypes.string.isRequired,
//   }).isRequired,
//   dispatch: PropTypes.func.isRequired,
// };

// class FullResults extends Component {
//   render() {
//     const { searchTerm, searchType } = this.props.searchState;
//     const { dataIsLoading } = this.props.mapData;
//     const { downloadData } = this.props.results;

//     const filename = addUnderscoreToString(
//       `${searchType}_${capitalizeFirstLetter(
//         searchTerm
//       )}_${createDateString()}.csv`
//     );

//     return (
//       <section className="results-outer">
//         <div className="results-inner">
//           <div
//             className="results-hamburger-button"
//             onClick={() => {
//               this.props.dispatch(toggleFullResultsAction(false));
//             }}
//           >
//             &#9776;
//           </div>
//           <ResultsSwitcher {...this.props} />

//           {downloadData && !dataIsLoading ? (
//             <CSVLink data={downloadData} filename={filename}>
//               <div className="download-button">
//                 <img src={downloadIcon} alt="Download button"></img>Download
//               </div>
//             </CSVLink>
//           ) : null}
//         </div>
//       </section>
//     );
//   }
// }

// FullResults.propTypes = {
//   searchState: PropTypes.shape({
//     searchTerm: PropTypes.oneOfType([
//       PropTypes.string,
//       PropTypes.oneOf([null]),
//     ]),
//     searchType: PropTypes.string.isRequired,
//   }).isRequired,
//   mapData: PropTypes.shape({
//     dataIsLoading: PropTypes.bool.isRequired,
//   }).isRequired,
//   results: PropTypes.shape({
//     downloadData: PropTypes.oneOfType([
//       PropTypes.array,
//       PropTypes.oneOf([null]),
//     ]),
//   }).isRequired,
//   dispatch: PropTypes.func.isRequired,
// };
