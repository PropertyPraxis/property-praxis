import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { handleGetYearsAction } from "../../actions/search";
import SearchBar from "./SearchBar";

/* The SearchContainer passes the avaialble years
for selection to SearchBar */
class SearchContainer extends Component {
  componentDidMount() {
    // load the available years
    const yearsRoute = "/api/praxisyears";
    this.props.dispatch(handleGetYearsAction(yearsRoute));
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
};

function mapStateToProps({ searchState, mapData, mapState, results }) {
  return { searchState, mapData, mapState, results };
}

export default withRouter(connect(mapStateToProps)(SearchContainer));
