import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { CSSTransition } from "react-transition-group";
import { getPropertiesFromMapData } from "../../utils/helper";
import DetailedSearchResults from "./DetailedSearchResults";

class DetailedResultsContainer extends Component {
  
  render() {
    const { isDetailedResultsOpen } = this.props.searchState;

    /*This component tree needs to know what the ppraxis 
    data properties and ids are. */
    const { ppraxis } = this.props.mapData;
    const details = getPropertiesFromMapData(ppraxis);
    if (details) {
      return (
        <CSSTransition
          in={isDetailedResultsOpen} //set false on load
          appear={true}
          timeout={0}
          classNames="results-drawer"
        >
          <DetailedSearchResults {...this.props} details={details} />
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
