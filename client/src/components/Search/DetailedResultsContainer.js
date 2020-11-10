import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { CSSTransition } from "react-transition-group";
import { updateDetailedSearch } from "../../actions/search";
import { getPropertiesFromMapData } from "../../utils/helper";
import { isGeoJSONEmpty } from "../../utils/api";
import DetailedSearchResults from "./DetailedSearchResults";

class DetailedResultsContainer extends Component {
  _parseStateForDetails = () => {
    /* something here to parse the current search state 
    and geojson return to determine the details ui*/
    
    // const { ppraxis } = this.props.mapData;

    // if (isGeoJSONEmpty(ppraxis)) {
    //   debugger;
    //   this.props.dispatch(updateDetailedSearch({ type: "no-data" }));
    // }else

    const details = getPropertiesFromMapData(ppraxis);
    return details;
  };

  render() {
    const { isOpen } = this.props.searchState.detailedSearch;
    const details = this._parseGeoJSONDetails();
    /*This component tree needs to know what the ppraxis 
    data properties and ids are. */

    if (details) {
      return (
        <CSSTransition
          in={isOpen} //set false on load
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
