import React from "react";
import { handleGetInitialMapDataAction } from "../actions/mapData";
import { connect } from "react-redux";
import "../scss/App.scss";

class App extends React.Component {
  componentDidMount() {
    this.props.dispatch(
      handleGetInitialMapDataAction("http://localhost:5000/api")
    );
  }

  render() {
    const loadingState =
      Object.entries(this.props.mapData).length === 0 &&
      this.props.mapData.constructor === Object;

    if (loadingState) {
      return "Loading...";
    } else {
      return JSON.stringify(this.props.mapData);
    }
  }
}
function mapStateToProps({ mapData }) {
  return { mapData };
}
export default connect(mapStateToProps)(App);
