import React, { Component } from "react";
import { connect } from "react-redux";
import { CSSTransition } from "react-transition-group";
import FullResults from "./FullResults";
import { createNewViewport } from "../../utils/map";
import { getMapStateAction } from "../../actions/mapState";
import "../../scss/Results.scss";

class ResultsContainer extends Component {
  _createNewViewport = geojson => {
    const { mapState } = this.props;
    //trigger new viewport
    const { longitude, latitude, zoom } = createNewViewport(geojson, mapState);
    this.props.dispatch(
      getMapStateAction({
        ...mapState,
        longitude,
        latitude,
        zoom,
        transitionDuration: 1000
      })
    );
  };

  render() {
    const { isFullResultsOpen } = this.props.results;
    const { searchTerm } = this.props.searchState;
    if (searchTerm !== null) {
      return (
        <CSSTransition
          in={isFullResultsOpen} //set to isOpen
          appear={true}
          timeout={300}
          classNames="results-container"
        >
          <FullResults
            {...this.props}
            createNewViewport={this._createNewViewport}
          />
        </CSSTransition>
      );
    }
    return null;
  }
}
function mapStateToProps({ mapData, mapState, results, searchState }) {
  return { mapData, mapState, results, searchState };
}
export default connect(mapStateToProps)(ResultsContainer);
//
