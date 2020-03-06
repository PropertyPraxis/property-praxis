import React, { Component } from "react";
import { CSSTransition } from "react-transition-group";
// import { FixedSizeList as List } from "react-window";
// import AutoSizer from "react-virtualized-auto-sizer";
import { handleSearchFullZipcode } from "../../actions/search";
import * as zipcodeIcon from "../../assets/img/zipcode-icon-transparent.png";
import * as speculatorIcon from "../../assets/img/speculator-icon-transparent.png";
import * as mapMarkerIcon from "../../assets/img/map-marker-transparent.png";
import "../../scss/Search.scss";

const PartialReturnResultSwitch = props => {
  const { searchType, partialResults } = props.searchState;
  switch (searchType) {
    case "All":
      return null;
    case "Address":
      return <PartialAddressResults {...props.searchState} />;
    case "Speculator":
      return <PartialSpeculatorResults {...props.searchState} />;
    case "Zipcode":
      return <PartialZipcodeResults {...props} />;
    default:
      return null;
  }
};

const PartialZipcodeResults = props => {
  const { partialResults } = props.searchState;
  const { year } = props.mapData;

  return (
    <section>
      <div className="partial-results-container">
        {partialResults.map((result, index) => {
          return (
            <div
              key={result.propzip}
              className={index % 2 ? "list-item-odd" : "list-item-even"}
              onClick={() => {
                // new action here
                console.log("Zip: ", result.propzip);
                props.dispatch(handleSearchFullZipcode(result.propzip, year));
              }}
            >
              <img src={zipcodeIcon} alt="Zipcode Result" /> {result.propzip}
            </div>
          );
        })}
      </div>
    </section>
  );
};

const PartialAddressResults = props => {
  const { partialResults } = props;
  return (
    <section>
      <div className="partial-results-container">
        {partialResults[0].mb.map((result, index) => {
          return (
            <div
              key={result.place_name}
              className={index % 2 ? "list-item-odd" : "list-item-even"}
              onClick={() => {
                // new action here
                console.log("Address: ", result);
              }}
            >
              <img src={mapMarkerIcon} alt="Address Result" />
              {result.place_name}
            </div>
          );
        })}
      </div>
    </section>
  );
};

const PartialSpeculatorResults = props => {
  const { partialResults } = props;
  return (
    <section>
      <div className="partial-results-container">
        {partialResults.map((result, index) => {
          return (
            <div
              key={result.own_id}
              className={index % 2 ? "list-item-odd" : "list-item-even"}
              onClick={() => {
                // new action here
                console.log("Speculator: ", result.own_id);
              }}
            >
              <img src={speculatorIcon} alt="Speculator Result" />
              {result.own_id}
            </div>
          );
        })}
      </div>
    </section>
  );
};

class PartialSearchResults extends Component {
  render() {
    const { partialResults, fullResults } = this.props.searchState;
    const resultLength = partialResults.length;

    if (resultLength > 0) {
      return <PartialReturnResultSwitch {...this.props} />;
    }
    return null;
  }
}

export default PartialSearchResults;

// TEST ADDRESS
// 17451 ST LOUIS, Detroit, Michigan 48212
