import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import {
  handleSearchPartialAddress,
  handleSearchPartialSpeculator,
  handleSearchPartialZipcode,
  resetSearch,
} from "../../actions/search";
import { togglePartialResultsAction } from "../../actions/results";
import { parseURLParams } from "../../utils/parseURL";
import SearchBar from "./SearchBar";

class SearchContainer extends Component {
  _setSearch = () => {
    // parse URL and dispatch params

    const { type, search, year } = parseURLParams(window.location.search);
    if (type && search && year) {
      this.props.dispatch(
        resetSearch({
          searchType: type,
          searchTerm: search,
          searchYear: year,
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
    if (prevProps.location.search !== this.props.history.location.search) {
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

export default withRouter(connect(mapStateToProps)(SearchContainer));
