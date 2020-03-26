import React, { Component } from "react";
import { Link } from "react-router-dom";
import { createNewViewport } from "../../utils/map";
import { getMapStateAction } from "../../actions/mapState";
import {
  handleSearchPartialZipcode,
  handleSearchPartialAddress,
  handleSearchPartialSpeculator,
  handleSearchFullZipcode,
  handleSearchFullSpeculator,
  handleSearchFullAddress,
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
import { toggleModalAction } from "../../actions/modal";

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
                //trigger data loading
                props.dispatch(dataIsLoadingAction(true));

                // change the partial results
                props.dispatch(
                  handleSearchPartialZipcode(result.propzip, year)
                );

                props.dispatch(handleSearchFullZipcode(result.propzip, year));
                // the route to parcels in zip
                const geoJsonRoute = `/api/geojson/parcels/zipcode/${result.propzip}/${year}`;
                //set map data and then create viewport
                props
                  .dispatch(handleGetParcelsByQueryAction(geoJsonRoute))
                  .then(geojson => {
                    //trigger new viewport pass down from PartialSearchResults
                    props.createNewViewport(geojson);

                    //trigger data loading off
                    props.dispatch(dataIsLoadingAction(false));
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
                props.dispatch(setSearchDisplayType("full-zipcode"));

                //close the partial results after
                props.togglePartialResults(false);

                // trigger the dowload data action
                const downloadDataRoute = `/api/zipcode-search/download/${result.propzip}/${year}`;
                props.dispatch(handleGetDownloadDataAction(downloadDataRoute));

                //toggle the results pane
                props.dispatch(toggleFullResultsAction(true));
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
    const geojsonRoute = `http://localhost:5000/api/geojson/parcels/address/${encodedCoords}/${year}`;
    this.props
      .dispatch(handleGetParcelsByQueryAction(geojsonRoute))
      .then(geojson => {
        //trigger new viewport pass down from PartialSearchResults
        this.props.createNewViewport(geojson);
        //trigger data loading off
        this.props.dispatch(dataIsLoadingAction(false));
      });
    //fill in the text input
    this.props.dispatch(
      resetSearch({
        searchTerm: result.place_name
      })
    );
    // set the display type to single-address
    this.props.dispatch(setSearchType("Address"));
    this.props.dispatch(setSearchDisplayType("single-address"));
    this.props.dispatch(toggleFullResultsAction(true));
    this.props.togglePartialResults(false);
  };

  render() {
    const { partialResults } = this.props.searchState;

    return (
      <section>
        <div className="partial-results-container">
          {partialResults[0].mb.map((result, index) => {
            const [longitude, latitude] = result.geometry.coordinates;
            const encodedCoords = encodeURI(
              JSON.stringify({ longitude, latitude })
            );
            return (
              <Link
                key={result.place_name}
                to={{
                  pathname: "/address",
                  search: `search=${result.place_name}&coordinates=${encodedCoords}`
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
    const { partialResults } = this.props.searchState;
    const { year } = this.props.mapData;
    const { mapState } = this.props;
    return (
      <section>
        <div className="partial-results-container">
          {partialResults.map((result, index) => {
            return (
              <Link
                key={index}
                to={{
                  pathname: "/speculator",
                  search: `search=${result.own_id}`
                }}
                onClick={() => {
                  this._onResultClick(result);
                  // //trigger data loading
                  // this.props.dispatch(dataIsLoadingAction(true));
                  // // change the partial results
                  // this.props.dispatch(
                  //   handleSearchPartialSpeculator(result.own_id, year)
                  // );
                  // this.props.dispatch(
                  //   handleSearchFullSpeculator(result.own_id, year)
                  // );
                  // // the route to parcels in zip
                  // const geoJsonRoute = `/api/geojson/parcels/speculator/${result.own_id}/${year}`;
                  // //set map data and then create viewport
                  // this.props
                  //   .dispatch(handleGetParcelsByQueryAction(geoJsonRoute))
                  //   .then(geojson => {
                  //     //trigger new viewport
                  //     //Note this is creating a default because it is a point
                  //     this.props.createNewViewport(geojson);
                  //     //trigger data loading off
                  //     this.props.dispatch(dataIsLoadingAction(false));
                  //   });
                  // //fill in the text input
                  // // this.props.dispatch(setSearchTerm(result.propzip));
                  // this.props.dispatch(
                  //   resetSearch({
                  //     // partialResults: [],
                  //     searchTerm: result.own_id
                  //   })
                  // );
                  // // set the display type to full
                  // this.props.dispatch(setSearchDisplayType("full-speculator"));
                  // //close the partial results after
                  // this.props.dispatch(togglePartialResultsAction(false));
                  // // trigger the dowload data action
                  // const downloadDataRoute = `/api/speculator-search/download/${result.own_id}/${year}`;
                  // this.props.dispatch(
                  //   handleGetDownloadDataAction(downloadDataRoute)
                  // );
                  // //toggle the results pane
                  // this.props.dispatch(toggleFullResultsAction(true));
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
// const PartialSpeculatorResults = props => {
//   const { partialResults } = props.searchState;
//   const { year } = props.mapData;
//   const { mapState } = props;
//   return (
//     <section>
//       <div className="partial-results-container">
//         {partialResults.map((result, index) => {
//           return (
//             <Link
//               key={result.propzip}
//               to={{
//                 pathname: "/speculator",
//                 search: `search=${result.own_id}`
//               }}
//               onClick={() => {
//                 //trigger data loading
//                 props.dispatch(dataIsLoadingAction(true));

//                 // change the partial results
//                 props.dispatch(
//                   handleSearchPartialSpeculator(result.own_id, year)
//                 );

//                 props.dispatch(handleSearchFullSpeculator(result.own_id, year));
//                 // the route to parcels in zip
//                 const geoJsonRoute = `/api/geojson/parcels/speculator/${result.own_id}/${year}`;
//                 //set map data and then create viewport
//                 props
//                   .dispatch(handleGetParcelsByQueryAction(geoJsonRoute))
//                   .then(geojson => {
//                     //trigger new viewport
//                     //Note this is creating a default because it is a point
//                     props.createNewViewport(geojson);

//                     //trigger data loading off
//                     props.dispatch(dataIsLoadingAction(false));
//                   });
//                 //fill in the text input
//                 // props.dispatch(setSearchTerm(result.propzip));
//                 props.dispatch(
//                   resetSearch({
//                     // partialResults: [],
//                     searchTerm: result.own_id
//                   })
//                 );
//                 // set the display type to full
//                 props.dispatch(setSearchDisplayType("full-speculator"));

//                 //close the partial results after
//                 props.dispatch(togglePartialResultsAction(false));

//                 // trigger the dowload data action
//                 const downloadDataRoute = `/api/speculator-search/download/${result.own_id}/${year}`;
//                 props.dispatch(handleGetDownloadDataAction(downloadDataRoute));

//                 //toggle the results pane
//                 props.dispatch(toggleFullResultsAction(true));
//               }}
//             >
//               <div className={index % 2 ? "list-item-odd" : "list-item-even"}>
//                 <img src={speculatorIcon} alt="Speculator Result" />
//                 {capitalizeFirstLetter(result.own_id)}
//               </div>
//             </Link>
//           );
//         })}
//       </div>
//     </section>
//   );
// };

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
