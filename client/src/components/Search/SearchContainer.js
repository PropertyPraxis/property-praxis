import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  handleSearchPartialAddress,
  handleSearchPartialSpeculator,
  handleSearchPartialZipcode,
  resetSearch,
} from "../../actions/search";
import { togglePartialResultsAction } from "../../actions/results";
import { createMapParams } from "../../utils/parseURL";
import SearchBar from "./SearchBar";

class SearchContainer extends Component {
  _setSearch = () => {
    // parse URL and dispatch params
    const { type, search, year } = createMapParams(window.location.search);
    if (type && search && year) {
      this.props.dispatch(
        resetSearch({
          searchDisplayType: "partial",
        })
      );
      this.props.dispatch(togglePartialResultsAction(false));
      //zipcode search
      if (type === "zipcode") {
        this.props.dispatch(handleSearchPartialZipcode(search, year));
      } else if (type === "address") {
        this.props.dispatch(handleSearchPartialAddress(search, year));
      } else if (type === "speculator") {
        this.props.dispatch(handleSearchPartialSpeculator(search, year));
      }
    }
  };

  componentDidMount() {
    this._setSearch();
  }

  componentDidUpdate(prevProps) {
    const { type, search, year } = this.props.mapState.params;
    if (
      prevProps.mapState.params.type !== type ||
      prevProps.mapState.params.search !== search ||
      prevProps.mapState.params.year !== year
    ) {
      this._setSearch();
    }
  }

  render() {
    return (
      <SearchBar
        searchBarType="grid-item"
        showSearchButtons={true}
        {...this.props}
      />
    );
  }
}

SearchContainer.propTypes = {
  searchState: PropTypes.object.isRequired,
  mapData: PropTypes.object.isRequired,
  mapState: PropTypes.object.isRequired,
  results: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function mapStateToProps({ searchState, mapData, mapState, results }) {
  return { searchState, mapData, mapState, results };
}

export default connect(mapStateToProps)(SearchContainer);
