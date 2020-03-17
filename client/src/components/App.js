import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { connect } from "react-redux";
import queryString from "query-string";
import {
  // handleGetInitialMapDataAction,
  handleGetInitialZipcodeDataAction,
  // handleGetParcelsByZipcodeAction,
  handleGetParcelsByQueryAction,
  setMarkerCoordsAction
} from "../actions/mapData";
import { getMapStateAction } from "../actions/mapState";
import { setDocHeightOnWindow } from "../utils/style";
import { createNewViewport } from "../utils/map";
import MapContainer from "./Map/MapContainer";
import SearchContainer from "./Search/SearchContainer";
import ResultsContainer from "./Results/ResultsContainer";
import Loading from "./Loading/Loading";
import PraxisModal from "./Modal/Modal";
import PPLogo from "../Logo/Logo";
import "../scss/App.scss";

class App extends Component {
  // returns a route dependent on the window location
  _routeSwitcher = (location, year) => {
    const { pathname } = location;
    const querySearchString = location.search;
    const { coordinates, search } = queryString.parse(querySearchString);
    const encodedCoords = encodeURI(coordinates);

    switch (pathname) {
      case "/zipcode":
        return `/api/geojson/parcels${pathname}/${search}/${year}`;
      case "/speculator":
        return `/api/geojson/parcels${pathname}/${search}/${year}`;
      case "/address":
        return `http://localhost:5000/api/geojson/parcels/address/${encodedCoords}/${year}`;
      default:
        return `/api/geojson/parcels/${year}`;
    }
  };

  // create new vieport dependent on current geojson bbox
  _createNewViewport = geojson => {
    //check to see what data is loaded
    const { year } = this.props.mapData;
    const features = geojson.features;
    const { mapState } = this.props;
    //instantiate new viewport object
    const { longitude, latitude, zoom } = createNewViewport(geojson, mapState);
    const newViewport = {
      ...mapState,
      longitude,
      latitude,
      zoom,
      transitionDuration: 1000
    };

    // if the return geojson has features aka the search term was
    // valid then change the veiwport accordingly
    features
      ? this.props.dispatch(getMapStateAction(newViewport))
      : this.props.dispatch(
          handleGetParcelsByQueryAction(`/api/geojson/parcels/${year}`)
        );
  };

  componentDidMount() {
    //set window height for mobile
    setDocHeightOnWindow();

    //check to see what data is loaded
    const { year } = this.props.mapData;
    const { coordinates, search } = queryString.parse(window.location.search);

    // much logic here!!  may need to work on this a bit more to simplify the mount
    // if there is a search term dispatch the get parcels action
    if (search !== undefined && coordinates === undefined) {
      const route = this._routeSwitcher(window.location, year);
      this.props
        .dispatch(handleGetParcelsByQueryAction(route))
        .then(geojson => {
          this._createNewViewport(geojson);
        });
    }

    if (search !== undefined && coordinates !== undefined) {
      const { latitude, longitude } = JSON.parse(coordinates);

      const route = this._routeSwitcher(window.location, year);
      // set the marker
      this.props.dispatch(setMarkerCoordsAction(latitude, longitude));
      //set the parcels within buffer
      this.props
        .dispatch(handleGetParcelsByQueryAction(route))
        .then(geojson => {
          this._createNewViewport(geojson);
        });
    }

    // if there is no search term then do a regular search for all parcels
    if (search === undefined) {
      this.props
        .dispatch(handleGetParcelsByQueryAction(`/api/geojson/parcels/${year}`))
        .then(geojson => {
          this._createNewViewport(geojson);
        });
    }
    //load zip data no matter what (this may change)
    this.props
      .dispatch(handleGetInitialZipcodeDataAction("/api/geojson/zipcodes"))
      .then(geojson => {
        // this._createNewViewport(geojson);
      });
  }

  render() {
    const { ppraxis, zips } = this.props.mapData;
    const { modalIsOpen } = this.props;

    const loadingState =
      Object.entries(ppraxis).length === 0 ||
      ppraxis.features === null ||
      Object.entries(zips).length === 0;

    if (loadingState) {
      return <Loading />;
    }
    return (
      <main>
        <div className="app-container">
          <Router>
            <Route path="/" component={MapContainer}></Route>
            <SearchContainer />
            <ResultsContainer />
          </Router>
          <PPLogo />
        </div>
      </main>
    );
  }
}

function mapStateToProps({ mapData, modalIsOpen, mapState }) {
  return { mapData, modalIsOpen, mapState };
}
export default connect(mapStateToProps)(App);
