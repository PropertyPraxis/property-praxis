import React, { Component } from "react";
import { connect } from "react-redux";
import SearchBar from "./SearchBar";

class SearchContainer extends Component {
  render() {
    return <SearchBar {...this.props} />;
  }
}
function mapStateToProps({ searchState, mapData }) {
  return { searchState, mapData };
}
export default connect(mapStateToProps)(SearchContainer);
