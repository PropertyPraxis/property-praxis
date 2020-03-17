import React, { Component } from "react";
import { CSSTransition } from "react-transition-group";
import "../../scss/Results.scss";

const Results = props => {
  return (
    <section >
      <div className="results-inner">hello</div>
    </section>
  );
};

class ResultsContainer extends Component {
  render() {
    return (
      <CSSTransition
        in={true}
        timeout={300}
        classNames="results-container"
        onEnter={() => {
          console.log("entered");
        }}
      >
        <Results/>
      </CSSTransition>
    );
  }
}

export default ResultsContainer;
