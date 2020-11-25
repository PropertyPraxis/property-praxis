import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import { setDocHeightOnWindow } from "../utils/helper";
import Home from "./pages/Home";
import DownloadData from "./pages/DownloadData";
import About from "./pages/About";
import Methodology from "./pages/Methodology";
import MapContainer from "./Map/MapContainer";
import SearchContainer from "./Search/SearchContainer";
import DetailedResultsContainer from "./Search/DetailedResultsContainer";
import LoadingIndicator from "./LoadingIndicator/LoadingIndicator";
import Error from "./Redirect/Error";
import PPLogo from "./Logo/Logo";

class App extends Component {
  componentDidMount() {
    //set window height for mobile
    setDocHeightOnWindow();
  }

  render() {
    return (
      <div className="app-container">
        <Router>
          <Switch>
            <Route exact path={"/"} component={Home}></Route>
            <Route path={"/map"} component={MapContainer}></Route>
            <Route path={"/data"} component={DownloadData}></Route>
            <Route path={"/methodology"} component={Methodology}></Route>
            <Route path={"/about"} component={About}></Route>
          </Switch>
          {/* The following components are inside Router to have access to Link */}
          <SearchContainer />
          {/* <DetailedResultsContainer /> */}
          <PPLogo />
          <LoadingIndicator {...this.props} />
          <Error />
        </Router>
      </div>
    );
  }
}

function mapStateToProps({ mapData, modal, mapState }) {
  return { mapData, modal, mapState };
}
export default connect(mapStateToProps)(App);

///////////////////////////////////////////////////////////////////////////////////////////////////////

// import React, { Component } from "react";
// import { BrowserRouter as Router, Route } from "react-router-dom";
// import { connect } from "react-redux";
// import queryString from "query-string";
// import PropTypes from "prop-types";
// import {
//   handleGetInitialZipcodeDataAction,
//   handleGetParcelsByQueryAction,
//   setMarkerCoordsAction,
//   dataIsLoadingAction,
//   getYearAction,
// } from "../actions/mapData";
// import {
//   setSearchType,
//   setSearchDisplayType,
//   handleSearchPartialZipcode,
//   handleSearchPartialSpeculator,
//   handleSearchPartialAddress,
//   resetSearch,
// } from "./../actions/search";
// import {
//   togglePartialResultsAction,
//   toggleFullResultsAction,
// } from "./../actions/results";
// import { getMapStateAction } from "../actions/mapState";
// import { handleGetViewerImageAction } from "./../actions/results";
// import { setDocHeightOnWindow, pathnameToSearchType } from "../utils/helper";
// import { createNewViewport } from "../utils/map";
// import MapContainer from "./Map/MapContainer";
// import SearchContainer from "./Search/SearchContainer";
// import ResultsContainer from "./Results/ResultsContainer";
// import Loading from "./Loading/Loading";
// import Home from "./pages/Home";
// import DownloadData from "./pages/DownloadData";
// import About from "./pages/About";
// import PPLogo from "./Logo/Logo";
// import Methodology from "./pages/Methodology";

// class MapApp extends Component {
//   _setSearch = (searchTerm, searchType, year) => {
//     this.props.dispatch(setSearchDisplayType("partial"));
//     this.props.dispatch(togglePartialResultsAction(false));
//     //zipcode search
//     if (searchType === "Zipcode") {
//       this.props.dispatch(handleSearchPartialZipcode(searchTerm, year));
//     }
//     if (searchType === "Address") {
//       this.props.dispatch(handleSearchPartialAddress(searchTerm, year));
//     }
//     if (searchType === "Speculator") {
//       this.props.dispatch(handleSearchPartialSpeculator(searchTerm, year));
//     }
//   };

//   // returns a route dependent on the window location
//   _routeSwitcher = (location, year) => {
//     const { pathname } = location;
//     const querySearchString = location.search;
//     const { coordinates, search } = queryString.parse(querySearchString);
//     const encodedCoords = encodeURI(coordinates);

//     switch (pathname) {
//       case "/zipcode":
//         return `/api/geojson/parcels${pathname}/${search}/${year}`;
//       case "/speculator":
//         return `/api/geojson/parcels${pathname}/${search}/${year}`;
//       case "/address":
//         return `/api/geojson/parcels/address/${encodedCoords}/${year}`;
//       default:
//         return `/api/geojson/parcels/${year}`;
//     }
//   };

//   _resultSwitcher = (searchType, searchTerm, geojson, year) => {
//     if (searchType === "Speculator") {
//       this.props.dispatch(
//         resetSearch({
//           searchTerm,
//           searchDisplayType: "full-speculator",
//         })
//       );
//     }

//     if (searchType === "Zipcode") {
//       this.props.dispatch(
//         resetSearch({
//           searchTerm,
//           searchDisplayType: "full-zipcode",
//         })
//       );
//     }

//     if (searchType === "Address") {
//       if (
//         geojson.features &&
//         geojson.features.length === 1 &&
//         geojson.features[0].properties.distance === 0
//       ) {
//         this.props.dispatch(
//           resetSearch({
//             searchTerm,
//             searchType: "Address",
//             searchDisplayType: "single-address",
//           })
//         );
//       }

//       /////
//       if (geojson.features && geojson.features.length > 1) {
//         this.props.dispatch(
//           resetSearch({
//             searchTerm,
//             searchType: "Address",
//             searchDisplayType: "multiple-parcels",
//           })
//         );
//       }
//     }

//     //toggle the results pane
//     this.props.dispatch(toggleFullResultsAction(true));
//   };

//   // Duplicated in PraxisMap!!
//   // create new vieport dependent on current geojson bbox
//   _createNewViewport = (geojson) => {
//     //check to see what data is loaded
//     const { year } = this.props.mapData;
//     const features = geojson.features;
//     const { mapState } = this.props;
//     //instantiate new viewport object
//     const { longitude, latitude, zoom } = createNewViewport(geojson, mapState);
//     const newViewport = {
//       ...mapState,
//       longitude,
//       latitude,
//       zoom,
//       transitionDuration: 1000,
//     };

//     // if the return geojson has features aka the search term was
//     // valid then change the veiwport accordingly
//     features
//       ? this.props.dispatch(getMapStateAction(newViewport))
//       : this.props.dispatch(
//           handleGetParcelsByQueryAction(`/api/geojson/parcels/${year}`)
//         );
//   };

//   componentDidMount() {
//     //set window height for mobile
//     setDocHeightOnWindow();

//     //check to see what data is loaded
//     let { coordinates, search, year } = queryString.parse(
//       window.location.search
//     );
//     const { pathname } = window.location;

//     //set the year
//     if (year) {
//       this.props.dispatch(getYearAction(year));
//     } else {
//       year = this.props.mapData.year;
//     }

//     //set the searchtype
//     const searchType = pathnameToSearchType(pathname);
//     this.props.dispatch(setSearchType(searchType));

//     // much logic here!!  may need to work on this a bit more to simplify the mount
//     // if there is a search term dispatch the get parcels action
//     if (search !== undefined && coordinates === undefined) {
//       //set the other search options
//       this._setSearch(search, searchType, year);

//       const route = this._routeSwitcher(window.location, year);
//       this.props.dispatch(dataIsLoadingAction(true));
//       this.props
//         .dispatch(handleGetParcelsByQueryAction(route))
//         .then((geojson) => {
//           this._createNewViewport(geojson);

//           this._resultSwitcher(searchType, search, geojson, year);

//           this.props.dispatch(dataIsLoadingAction(false));
//         });
//     }

//     // for an address point
//     if (search !== undefined && coordinates !== undefined) {
//       //set the other search options
//       this._setSearch(search, searchType, year);

//       const { latitude, longitude } = JSON.parse(coordinates);

//       const route = this._routeSwitcher(window.location, year);
//       //loading
//       this.props.dispatch(dataIsLoadingAction(true));

//       // set the marker
//       this.props.dispatch(setMarkerCoordsAction(latitude, longitude));

//       //set the viewer
//       this.props.dispatch(handleGetViewerImageAction(longitude, latitude));
//       //set the parcels within buffer
//       this.props
//         .dispatch(handleGetParcelsByQueryAction(route))
//         .then((geojson) => {
//           this._resultSwitcher(searchType, search, geojson, year);

//           this._createNewViewport(geojson);
//           this.props.dispatch(dataIsLoadingAction(false));
//         });
//     }

//     // if there is no search term then do a regular search for all parcels
//     if (search === undefined || pathname === "/") {
//       this.props.dispatch(dataIsLoadingAction(true));
//       this.props
//         .dispatch(handleGetParcelsByQueryAction(`/api/geojson/parcels/${year}`))
//         .then((geojson) => {
//           this._createNewViewport(geojson);
//           this.props.dispatch(dataIsLoadingAction(false));
//         });
//     }
//     //load zip data no matter what (this may change)
//     this.props
//       .dispatch(handleGetInitialZipcodeDataAction("/api/geojson/zipcodes"))
//       .then((geojson) => {
//         // this._createNewViewport(geojson);
//       });
//   }

//   render() {
//     const { ppraxis, zips, dataIsLoading } = this.props.mapData;
//     const { isOpen } = this.props.modal;

//     const loadingState =
//       Object.entries(ppraxis).length === 0 ||
//       ppraxis.features === null ||
//       Object.entries(zips).length === 0;
//     if (loadingState) {
//       return <Loading />;
//     }
//     return (
//       <main>
//         <div className="app-container">
//           <MapContainer />
//           <SearchContainer />
//           <ResultsContainer />
//           <PPLogo />
//         </div>
//       </main>
//     );
//   }
// }

// MapApp.propTypes = {
//   modal: PropTypes.shape({
//     isOpen: PropTypes.bool.isRequired,
//   }),
//   mapData: PropTypes.shape({
//     dataIsLoading: PropTypes.bool.isRequired,
//     ppraxis: PropTypes.object.isRequired,
//     zips: PropTypes.object.isRequired,
//     year: PropTypes.string.isRequired,
//   }).isRequired,
//   mapState: PropTypes.object.isRequired,
//   dispatch: PropTypes.func.isRequired,
// };

// function App(props) {
//   const { isOpen } = props.modal;

//   if (isOpen) {
//     return <Home {...props} />;
//   }

//   return <MapApp {...props} />;

//   // return (
//   //   <Router>
//   //     <Route path={"/"} component={Home} exact></Route>
//   //     <Route
//   //       path={"/map"}
//   //       component={() => <MapApp {...props} />}
//   //       exact
//   //     ></Route>
//   //     <Route path={"/data"} component={DownloadData} exact></Route>
//   //     <Route path={"/methodology"} component={Methodology} exact></Route>
//   //     <Route path={"/about"} component={About} exact></Route>
//   //   </Router>
//   // );
// }

// App.propTypes = {
//   mapData: PropTypes.object.isRequired,
//   mapState: PropTypes.object.isRequired,
//   modal: PropTypes.shape({
//     isOpen: PropTypes.bool.isRequired,
//   }).isRequired,
// };

// function mapStateToProps({ mapData, modal, mapState }) {
//   return { mapData, modal, mapState };
// }
// export default connect(mapStateToProps)(App);
