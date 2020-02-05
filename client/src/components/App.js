import React from "react";
import {
  handleGetInitialMapDataAction,
  handleGetInitialZipcodeDataAction
} from "../actions/mapData";
import { setDocHeightOnWindow } from "../utils/style";
import { connect } from "react-redux";
import MapContainer from "./Map/MapContainer";
import SearchContainer from "./Search/SearchContainer";
import PPLogo from "../Logo/Logo";
import "../scss/App.scss";

class App extends React.Component {
  componentDidMount() {
    //set window height for mobile
    setDocHeightOnWindow();

    //load data
    const { year } = this.props.mapData;
    this.props.dispatch(
      handleGetInitialMapDataAction(
        `http://localhost:5000/api/geojson/parcels/${year}`
      )
    );
    this.props.dispatch(
      handleGetInitialZipcodeDataAction(
        "http://localhost:5000/api/geojson/zipcodes"
      )
    );
  }

  render() {
    const { ppraxis, zips } = this.props.mapData;

    const loadingState =
      Object.entries(ppraxis).length === 0 || Object.entries(zips).length === 0;

    if (loadingState) {
      return "Loading...";
    } else {
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
function mapStateToProps({ mapData }) {
  return { mapData };
}
export default connect(mapStateToProps)(App);
