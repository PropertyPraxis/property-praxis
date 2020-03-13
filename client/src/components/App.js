import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import queryString from "query-string";
import {
  handleGetInitialMapDataAction,
  handleGetInitialZipcodeDataAction,
  handleGetParcelsByZipcodeAction
} from "../actions/mapData";
import { getMapStateAction } from "../actions/mapState";
import { setDocHeightOnWindow } from "../utils/style";
import { createNewViewport } from "../utils/map";
import MapContainer from "./Map/MapContainer";
import SearchContainer from "./Search/SearchContainer";
import Loading from "./Loading/Loading";
import PraxisModal from "./Modal/Modal";
import PPLogo from "../Logo/Logo";
import "../scss/App.scss";

// returns a route dependent on the window location
const routeSwitcher = (location, year) => {
  const { pathname, search } = location;
  const searchTerm = queryString.parse(search);

  switch (pathname) {
    case "/zipcode":
      return `/api/geojson/parcels${pathname}/${searchTerm.search}/${year}`;
    default:
      return `/api/geojson/parcels/${year}`;
  }
};

class App extends Component {
  componentDidMount() {
    //set window height for mobile
    setDocHeightOnWindow();

    //check to see what data is loaded
    const { year } = this.props.mapData;
    const { search } = window.location;
    const searchTerm = queryString.parse(search).search;

    // much logic here!!  may need to work on this a bit more to simplify the mount
    // if there is a search term dispatch the get parcels action
    if (searchTerm !== undefined) {
      const route = routeSwitcher(window.location, year);
      const { mapState } = this.props;
      this.props
        .dispatch(handleGetParcelsByZipcodeAction(route))
        .then(geojson => {
          const features = geojson.features;
          // if the return geojson has features aka the search term was
          // valid then change the veiwport accordingly
          if (features) {
            //trigger new viewport
            const { longitude, latitude, zoom } = createNewViewport(
              geojson,
              mapState
            );

            this.props.dispatch(
              getMapStateAction({
                ...mapState,
                longitude,
                latitude,
                zoom,
                transitionDuration: 1000
              })
            );
            // if there are no features then do a regular serarch for all parcels
          } else {
            this.props.dispatch(
              handleGetInitialMapDataAction(`/api/geojson/parcels/${year}`)
            );
          }
        });
      // if there is no search term then do a regular search for all parcels
    } else {
      this.props.dispatch(
        handleGetInitialMapDataAction(`/api/geojson/parcels/${year}`)
      );
    }

    //load zip data no matter what (this may change)
    this.props.dispatch(
      handleGetInitialZipcodeDataAction("/api/geojson/zipcodes")
    );
  }

  render() {
    const { ppraxis, zips } = this.props.mapData;
    const { modalIsOpen } = this.props;
    const loadingState =
      Object.entries(ppraxis).length === 0 ||
      ppraxis.features === null ||
      Object.entries(zips).length === 0;

    if (modalIsOpen) {
      return <PraxisModal />;
    } else {
      if (loadingState) {
        return <Loading />;
      }
      return (
        <main>
          <div className="app-container">
            <Router>
              <Route path="/" component={MapContainer}></Route>
              <SearchContainer />
            </Router>
            <PPLogo />
          </div>
        </main>
      );
    }
  }
}

function mapStateToProps({ mapData, modalIsOpen, mapState }) {
  return { mapData, modalIsOpen, mapState };
}
export default connect(mapStateToProps)(App);
