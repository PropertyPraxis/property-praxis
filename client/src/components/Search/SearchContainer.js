import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import SearchBar from "./SearchBar";

class SearchContainer extends Component {
  render() {
    return <SearchBar {...this.props} />;
  }
}

SearchContainer.propTypes = {
  searchState: PropTypes.object.isRequired,
  mapData: PropTypes.object.isRequired,
  mapState: PropTypes.object.isRequired,
  results: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function mapStateToProps({ searchState, mapData, mapState, results }) {
  return { searchState, mapData, mapState, results };
}

export default connect(mapStateToProps)(SearchContainer);
