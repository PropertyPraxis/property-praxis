import React, { Component } from "react";
import { connect } from "react-redux";
import { CSSTransition } from "react-transition-group";
import { toggleResultsAction } from "../../actions/results";
import MapViewer from "./MapViewer";
import "../../scss/Results.scss";

const Results = props => {
  return (
    <section className="results-outer">
      <div className="results-inner">
          <MapViewer {...props}/>
          <div>Property Praxis Address</div>
          <div>Speculator</div>
      </div>
    </section>
  );
};

class ResultsContainer extends Component {
  render() {
    const { isOpen } = this.props.results;
    return (
      <CSSTransition
        in={true} //set to isOpen
        appear={true}
        timeout={300}
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
function mapStateToProps({ mapData, mapState, results }) {
  return { mapData, mapState, results };
}
export default connect(mapStateToProps)(ResultsContainer);
//
