import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { CSSTransition } from "react-transition-group";
import DetailedSearchResults from "./DetailedSearchResults";
import { createNewViewport } from "../../utils/map";
import { getMapStateAction } from "../../actions/mapState";

class ResultsContainer extends Component {
  _createNewViewport = (geojson) => {
    const { mapState } = this.props;
    //trigger new viewport
    const { longitude, latitude, zoom } = createNewViewport(geojson, mapState);
    this.props.dispatch(
      getMapStateAction({
        ...mapState,
        longitude,
        latitude,
        zoom,
        transitionDuration: 1000,
      })
    );
  };

  render() {
    const { isDetailedResultsOpen } = this.props.searchState;

    return (
      <CSSTransition
        in={isDetailedResultsOpen} //set to isOpen
        appear={true}
        timeout={0}
        classNames="results-drawer"
      >
        <DetailedSearchResults {...this.props} />
      </CSSTransition>
    );
  }
}

ResultsContainer.propTypes = {
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

export default connect(mapStateToProps)(ResultsContainer);
