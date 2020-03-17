import React, { Component } from "react";
import { connect } from "react-redux";
import { CSSTransition } from "react-transition-group";
import { toggleResultsAction } from "../../actions/results";
import MapViewer from "./MapViewer";
import "../../scss/Results.scss";

const Results = props => {
  return (
    <section>
      <div className="results-inner">
        <div>
          <MapViewer />
        </div>
      </div>
    </section>
  );
};

class ResultsContainer extends Component {
  render() {
    const { resultsIsOpen } = this.props;
    return (
      <CSSTransition
        in={resultsIsOpen}
        appear={true}
        timeout={3000}
        classNames="results-container"
      >
        {state => {
          console.log("state", state);
          return <Results {...this.props} />;
        }}
      </CSSTransition>
    );
  }
}
function mapStateToProps({ mapData, mapState, resultsIsOpen }) {
  return { mapData, mapState, resultsIsOpen };
}
export default connect(mapStateToProps)(ResultsContainer);
//
