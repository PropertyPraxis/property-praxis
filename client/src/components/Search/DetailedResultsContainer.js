import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { CSSTransition } from "react-transition-group";
import { updateDetailedSearch } from "../../actions/search";
import { getDetailsFromGeoJSON } from "../../utils/helper";
import DetailedSearchResults from "./DetailedSearchResults";

class DetailedResultsContainer extends Component {
  _parseDetails = () => {
    const { ppraxis } = this.props.mapData;
    const { details, detailsType } = getDetailsFromGeoJSON(ppraxis);

    return { details, detailsType };
  };

  render() {
    const { isOpen } = this.props.searchState.detailedSearch;
    const { details, detailsType } = this._parseDetails();
    if (details) {
      return (
        <CSSTransition
          in={isOpen} //set false on load
          appear={true}
          timeout={0}
          classNames="results-drawer"
        >
          <DetailedSearchResults
            {...this.props}
            details={details}
            detailsType={detailsType}
          />
        </CSSTransition>
      );
    }
    return null;
  }
}

DetailedResultsContainer.propTypes = {
  mapData: PropTypes.object.isRequired,
  mapState: PropTypes.object.isRequired,
  results: PropTypes.shape({ isFullResultsOpen: PropTypes.bool.isRequired })
    .isRequired,
  searchState: PropTypes.shape({
    searchTerm: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number, //null
    ]),
  }).isRequired,
};

function mapStateToProps({ mapData, mapState, searchState }) {
  return { mapData, mapState, searchState };
}

export default withRouter(connect(mapStateToProps)(DetailedResultsContainer));
