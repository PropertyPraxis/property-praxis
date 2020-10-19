import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
  // handleSearchPartialZipcode,
  // handleSearchPartialAddress,
  // handleSearchPartialSpeculator,
  handleSearchFullZipcode,
  resetSearch,
} from "../../actions/search";
import {
  setMarkerCoordsAction,
  dataIsLoadingAction,
} from "../../actions/mapData";
import {
  handleGetViewerImageAction,
  togglePartialResultsAction,
  toggleFullResultsAction,
  handleGetDownloadDataAction,
} from "../../actions/results";
import {
  capitalizeFirstLetter,
  parseSearchResults,
  sanitizeSearchResult,
  createQueryStringFromSearch,
} from "../../utils/helper";
import * as zipcodeIcon from "../../assets/img/zipcode-icon-transparent.png";
import * as speculatorIcon from "../../assets/img/speculator-icon-transparent.png";
import * as mapMarkerIcon from "../../assets/img/map-marker-transparent.png";

const primaryResultIcons = {
  address: mapMarkerIcon,
  speculator: speculatorIcon,
  zipcode: zipcodeIcon,
};

///////////////////////////////////////////
//Partial Results refactor

class PrimaryResults extends Component {
  _onResultClick = (result, { inner }) => {
    const {
      searchType,
      searchYear,
      searchTerm,
      searchDisplayType,
    } = this.props.searchState;

    // set the search params
    this.props.dispatch(
      resetSearch({
        searchType,
        searchTerm,
        searchYear,
        searchDisplayType,
      })
    );
    this.props.setSearchLocationParams(result, { inner: inner, ...rest });
  };

  render() {
    const { primaryResults } = this.props.searchState;
    const { searchYear } = this.props.searchState;
    return (
      <section>
        <ul className="partial-results-container">
          {primaryResults.map((result, index) => {
            const { type, search, coordinates, year } = sanitizeSearchResult(
              result,
              searchYear
            );

            const searchQueryRoute = createQueryStringFromSearch({
              type,
              search,
              coordinates,
              year,
            });

            return (
              <Link
                key={searchQueryRoute}
                to={searchQueryRoute}
                onClick={() => {
                  this._onResultClick(result, { inner: index });
                }}
              >
                <li className={index % 2 ? "list-item-odd" : "list-item-even"}>
                  <img src={primaryResultIcons[type]} alt={`Icon of ${type}`} />
                  {search}
                </li>
              </Link>
            );
          })}
        </ul>
      </section>
    );
  }
}

export default PrimaryResults;
//////////////////////////////////////////////

// class PrimaryResult {
//   constructor() {}

//   buildRoute = (searchType) => {
//     switch (searchType) {

//     }
//   };
// }

// const PartialReturnResultSwitch = (props) => {
//   const { searchType, primaryResults } = props.searchState;

//   switch (searchType) {
//     case "all":
//       return <PartialAllResults {...props} />;
//     case "address":
//       return (
//         <PartialAddressResults
//           {...props}
//           partialSearchResults={primaryResults}
//         />
//       );
//     case "speculator":
//       return (
//         <PartialSpeculatorResults
//           {...props}
//           partialSearchResults={primaryResults}
//         />
//       );
//     case "zipcode":
//       return (
//         <PartialZipcodeResults
//           {...props}
//           partialSearchResults={primaryResults}
//         />
//       );
//     default:
//       return null;
//   }
// };

// PartialReturnResultSwitch.propTypes = {
//   searchState: PropTypes.shape({
//     search: PropTypes.object.isRequired,
//     primaryResults: PropTypes.array.isRequired,
//   }).isRequired,
// };

// class PartialZipcodeResults extends Component {
//   _onResultClick = (result) => {
//     const { searchYear } = this.props.searchState;

//     // change the partial results
//     // this.props.dispatch(handleSearchPartialZipcode(result.propzip, searchYear));
//     this.props.dispatch(handleSearchFullZipcode(result.propzip, searchYear));

//     // set the search params
//     this.props.dispatch(
//       resetSearch({
//         searchType: "zipcode",
//         searchTerm: result.propzip,
//         searchDisplayType: "full-zipcode",
//       })
//     );

//     // close the partial results after
//     this.props.togglePartialResults(false);

//     // //toggle the results pane
//     this.props.dispatch(toggleFullResultsAction(true));

//     // trigger the dowload data action
//     // const downloadDataRoute = `/api/zipcode-search/download/${result.propzip}/${year}`;
//     // this.props.dispatch(handleGetDownloadDataAction(downloadDataRoute));
//   };

//   render() {
//     const { partialSearchResults } = this.props;
//     const { searchYear } = this.props.searchState;
//     return (
//       <section>
//         <ul className="partial-results-container">
//           {partialSearchResults.map((result, index) => {
//             const search = `type=zipcode&search=${result.propzip}&year=${searchYear}`;
//             return (
//               <Link
//                 key={result.propzip}
//                 to={{
//                   pathname: "/map",
//                   search,
//                 }}
//                 onClick={() => {
//                   this._onResultClick(result);
//                 }}
//               >
//                 <li className={index % 2 ? "list-item-odd" : "list-item-even"}>
//                   <img src={zipcodeIcon} alt="Zipcode Result" />
//                   {result.propzip}
//                 </li>
//               </Link>
//             );
//           })}
//         </ul>
//       </section>
//     );
//   }
// }

// PartialZipcodeResults.propTypes = {
//   searchState: PropTypes.shape({
//     searchYear: PropTypes.string.isRequired,
//   }).isRequired,
//   partialSearchResults: PropTypes.string.isRequired,
//   dispatch: PropTypes.func.isRequired,
// };

// class PartialAddressResults extends Component {
//   _onResultClick = (result) => {
//     const { searchYear } = this.props.searchState;
//     const [longitude, latitude] = result.geometry.coordinates;
//     const encodedCoords = encodeURI(JSON.stringify({ longitude, latitude }));

//     //trigger data loading
//     // this.props.dispatch(dataIsLoadingAction(true));

//     // change the partial results
//     // this.props.dispatch(
//     //   handleSearchPartialAddress(result.place_name, searchYear)
//     // );

//     //add a point marker
//     this.props.dispatch(setMarkerCoordsAction(latitude, longitude));

//     //set new viewer in results
//     this.props.dispatch(handleGetViewerImageAction(longitude, latitude));

//     // set the search params
//     this.props.dispatch(
//       resetSearch({
//         searchType: "address",
//         searchTerm: result.place_name,
//         setSearchDisplayType: "single-address", // THIS CAN ALSO BE "multiple-parcels"
//       })
//     );

//     // toggle results
//     this.props.dispatch(toggleFullResultsAction(true));
//     this.props.togglePartialResults(false);

//     // get the download data for coords
//     // const downloadRoute = `/api/address-search/download/${encodedCoords}/${searchYear }`;
//     // this.props.dispatch(handleGetDownloadDataAction(downloadRoute));

//     // this.props.dispatch(dataIsLoadingAction(false));

//     ///////////////////////////////////////////////////////////////////////////////////
//     //set map data and then create viewport
//     // const geojsonRoute = `/api/geojson/parcels/address/${encodedCoords}/${searchYear }`;
//     // this.props
//     //   .dispatch(handleGetParcelsByQueryAction(geojsonRoute))
//     //   .then((geojson) => {
//     //     if (
//     //       geojson.features &&
//     //       geojson.features.length === 1 &&
//     //       geojson.features[0].properties.distance === 0
//     //     ) {
//     //       this.props.dispatch(
//     //         resetSearch({
//     //           searchTerm: result.place_name,
//     //           searchType: "address",
//     //           searchDisplayType: "single-address",
//     //         })
//     //       );
//     //     }

//     //     /////
//     //     if (geojson.features && geojson.features.length > 1) {
//     //       this.props.dispatch(
//     //         resetSearch({
//     //           searchTerm: result.place_name,
//     //           searchType: "address",
//     //           searchDisplayType: "multiple-parcels",
//     //         })
//     //       );
//     //     }
//     //   });
//   };

//   render() {
//     const { partialSearchResults } = this.props;
//     const { searchYear } = this.props.searchState;
//     return (
//       <section>
//         <ul className="partial-results-container">
//           {partialSearchResults.map((result, index) => {
//             const [longitude, latitude] = result.geometry.coordinates;
//             const encodedCoords = encodeURI(
//               JSON.stringify({ longitude, latitude })
//             );
//             const search = `type=address&search=${result.place_name}&coordinates=${encodedCoords}&year=${searchYear}`;
//             return (
//               <Link
//                 key={result.place_name}
//                 to={{
//                   pathname: "/map",
//                   search,
//                 }}
//                 className={index % 2 ? "list-item-odd" : "list-item-even"}
//                 onClick={() => {
//                   this._onResultClick(result);
//                 }}
//               >
//                 <li>
//                   <img src={mapMarkerIcon} alt="Address Result" />
//                   {result.place_name}
//                 </li>
//               </Link>
//             );
//           })}
//         </ul>
//       </section>
//     );
//   }
// }

// PartialAddressResults.propTypes = {
//   searchState: PropTypes.shape({
//     searchYear: PropTypes.string.isRequired,
//   }).isRequired,
//   partialSearchResults: PropTypes.string.isRequired,
//   dispatch: PropTypes.func.isRequired,
// };

// class PartialSpeculatorResults extends Component {
//   _onResultClick = (result) => {
//     const { searchYear } = this.props.searchState;

//     //trigger data loading
//     // this.props.dispatch(dataIsLoadingAction(true));

//     // change the partial results
//     // this.props.dispatch(
//     //   handleSearchPartialSpeculator(result.own_id, searchYear)
//     // );

//     // trigger the dowload data action
//     const downloadDataRoute = `/api/speculator-search/download/${result.own_id}/${searchYear}`;
//     this.props.dispatch(handleGetDownloadDataAction(downloadDataRoute));

//     // set the search params
//     this.props.dispatch(
//       resetSearch({
//         searchType: "speculator",
//         searchTerm: result.own_id,
//         searchDisplayType: "full-speculator",
//       })
//     );

//     // close the partial results after
//     this.props.togglePartialResults(false);
//     //toggle the results pane
//     this.props.dispatch(toggleFullResultsAction(true));
//   };

//   render() {
//     const { partialSearchResults } = this.props;
//     const { searchYear } = this.props.searchState;
//     return (
//       <section>
//         <ul className="partial-results-container">
//           {partialSearchResults.map((result, index) => {
//             const search = `type=speculator&search=${result.own_id}&year=${searchYear}`;
//             return (
//               <Link
//                 key={index}
//                 to={{
//                   pathname: "/map",
//                   search,
//                 }}
//                 onClick={() => {
//                   this._onResultClick(result);
//                 }}
//               >
//                 <li className={index % 2 ? "list-item-odd" : "list-item-even"}>
//                   <img src={speculatorIcon} alt="Speculator Result" />
//                   {capitalizeFirstLetter(result.own_id)}
//                 </li>
//               </Link>
//             );
//           })}
//         </ul>
//       </section>
//     );
//   }
// }

// PartialSpeculatorResults.propTypes = {
//   searchState: PropTypes.shape({
//     searchYear: PropTypes.string.isRequired,
//   }).isRequired,
//   partialSearchResults: PropTypes.string.isRequired,
//   dispatch: PropTypes.func.isRequired,
// };

// class PartialAllResults extends Component {
//   render() {
//     const { primaryResults } = this.props.searchState;
//     return (
//       <div className="partial-results-container-all">
//         <div className="partial-results-spacer"></div>
//         <div className="partial-results-combined">
//           {primaryResults[0].length > 0 ? (
//             <div className="partial-results-all-title">Address Results</div>
//           ) : null}

//           <PartialAddressResults
//             {...this.props}
//             partialSearchResults={primaryResults[0]}
//           />

//           {primaryResults[1].length > 0 ? (
//             <div className="partial-results-all-title">Speculator Results</div>
//           ) : null}

//           <PartialSpeculatorResults
//             {...this.props}
//             partialSearchResults={primaryResults[1]}
//           />

//           {primaryResults[2].length > 0 ? (
//             <div className="partial-results-all-title">Zipcodes Results</div>
//           ) : null}
//           <PartialZipcodeResults
//             {...this.props}
//             partialSearchResults={primaryResults[2]}
//           />
//         </div>
//       </div>
//     );
//   }
// }

// PartialAllResults.propTypes = {
//   searchState: PropTypes.shape({ primaryResults: PropTypes.array.isRequired })
//     .isRequired,
// };

// class PartialSearchResults extends Component {
//   // when user clicks on a result the partial results disappear
//   _togglePartialResults = (isOpen) => {
//     this.props.dispatch(togglePartialResultsAction(isOpen));
//   };

//   render() {
//     const resultLength = this.props.searchState.partialResults.length;
//     const { isPartialResultsOpen } = this.props.results;

//     if (resultLength > 0 && isPartialResultsOpen) {
//       return (
//         <PartialReturnResultSwitch
//           {...this.props}
//           togglePartialResults={this._togglePartialResults}
//         />
//       );
//     }
//     return null;
//   }
// }

// PartialSearchResults.propTypes = {
//   searchState: PropTypes.shape({
//     partialResults: PropTypes.array.isRequired,
//   }),
//   results: PropTypes.shape({
//     isPartialResultsOpen: PropTypes.bool.isRequired,
//   }),
//   dispatch: PropTypes.func.isRequired,
// };

// export default PartialSearchResults;

// TEST ADDRESS
// 17451 ST LOUIS, Detroit, Michigan 48212
