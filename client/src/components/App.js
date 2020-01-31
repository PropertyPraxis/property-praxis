import React from "react";
import {
  handleGetInitialMapDataAction,
  handleGetInitialZipcodeDataAction
} from "../actions/mapData";
import { connect } from "react-redux";
import MapContainer from "./Map/MapContainer";
import PPLogo from "../Logo/Logo";
import "../scss/App.scss";

class App extends React.Component {
  componentDidMount() {
    // important height styling for mobile
    //this can be placed into utils
    function setDocHeight() {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight / 100}px`
      );
    }

    window.addEventListener("resize", function() {
      setDocHeight();
    });
    window.addEventListener("orientationchange", function() {
      setDocHeight();
    });

    setDocHeight();

    //load data
    this.props.dispatch(
      handleGetInitialMapDataAction("http://localhost:5000/api/ppraxis")
    );

    this.props.dispatch(
      handleGetInitialZipcodeDataAction("http://localhost:5000/api/zipcodes")
    );
  }

  render() {
    const { ppraxis, zips } = this.props.mapData;

    console.log("ppraxis", Object.entries(ppraxis).length);
    console.log("zips", Object.entries(zips).length);

    const loadingState =
      Object.entries(ppraxis).length === 0 || Object.entries(zips).length === 0;
    console.log("Loading state: ", loadingState);

    if (loadingState) {
      return "Loading...";
    } else {
      return (
        <main>
          <div className="app-container">
            <MapContainer />
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
