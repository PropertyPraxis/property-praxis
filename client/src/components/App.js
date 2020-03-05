import React, { Component } from "react";
import {
  handleGetInitialMapDataAction,
  handleGetInitialZipcodeDataAction
} from "../actions/mapData";
import { setDocHeightOnWindow } from "../utils/style";
import { connect } from "react-redux";
import MapContainer from "./Map/MapContainer";
import SearchContainer from "./Search/SearchContainer";
import Loading from "./Loading/Loading";
import PraxisModal from "./Modal/Modal";
import PPLogo from "../Logo/Logo";
import "../scss/App.scss";

class App extends Component {
  componentDidMount() {
    //set window height for mobile
    setDocHeightOnWindow();

    //load data
    const { year } = this.props.mapData;
    this.props.dispatch(
      handleGetInitialMapDataAction(`/api/geojson/parcels/${year}`)
    );
    this.props.dispatch(
      handleGetInitialZipcodeDataAction("/api/geojson/zipcodes")
    );
  }

  render() {
    const { ppraxis, zips } = this.props.mapData;
    const { modalIsOpen } = this.props;

    const loadingState =
      Object.entries(ppraxis).length === 0 || Object.entries(zips).length === 0;

    if (modalIsOpen) {
      return <PraxisModal />;
    } else {
      if (loadingState) {
        return <Loading />;
      }
      return (
        <main>
          <div className="app-container">
            <MapContainer />
            <SearchContainer />
            <PPLogo />
          </div>
        </main>
      );
    }
  }
}

function mapStateToProps({ mapData, modalIsOpen }) {
  return { mapData, modalIsOpen };
}
export default connect(mapStateToProps)(App);
