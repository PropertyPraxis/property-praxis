import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { updatePrimarySearch } from "../../actions/search";
import {
  sanitizeSearchResult,
  createAPIQueryStringFromSearch,
  setResultFromParams,
} from "../../utils/helper";
import * as zipcodeIcon from "../../assets/img/zipcode-icon-transparent.png";
import * as speculatorIcon from "../../assets/img/speculator-icon-transparent.png";
import * as mapMarkerIcon from "../../assets/img/map-marker-transparent.png";
import * as styleVars from "../../scss/colors.scss";

const primaryResultIcons = {
  address: mapMarkerIcon,
  speculator: speculatorIcon,
  zipcode: zipcodeIcon,
};

class PrimaryResults extends Component {
  _handleOnMouseOver = () => {
    // turn active state to true
    this.props.dispatch(updatePrimarySearch({ isActive: true }));
  };

  _handleOnMouseOut = () => {
    this.props.dispatch(updatePrimarySearch({ isActive: false }));
  };

  _handleOnClick = () => {
    this.props.dispatch(updatePrimarySearch({ isOpen: false }));
  };

  componentWillUnmount() {
    // turn active state to true
    this.props.dispatch(updatePrimarySearch({ isActive: false }));
  }

  render() {
    const { searchYear } = this.props.searchState.searchParams;
    const { index } = this.props.searchState.primarySearch;
    const { results } = this.props;
    debugger;
    return (
      <section
        className="partial-results-container"
        onMouseOver={this._handleOnMouseOver}
        onMouseOut={this._handleOnMouseOut}
      >
        <ul>
          {results.map((result, i) => {
            const {
              type,
              code = null,
              ownid = null,
              place = null,
              coordinates = null,
              year,
            } = sanitizeSearchResult({
              result,
              year: searchYear,
            });

            const searchQueryRoute = createAPIQueryStringFromSearch(
              {
                type,
                code,
                ownid,
                place,
                coordinates,
                year,
              },
              "/map"
            );

            return (
              <Link key={searchQueryRoute} to={searchQueryRoute}>
                <li
                  className={i % 2 ? "list-item-odd" : "list-item-even"}
                  style={
                    i === index
                      ? { backgroundColor: styleVars.uiMedGray }
                      : null
                  }
                  onClick={this._handleOnClick}
                >
                  <img src={primaryResultIcons[type]} alt={`Icon of ${type}`} />
                  {setResultFromParams({
                    type,
                    code,
                    ownid,
                    place,
                  })}
                </li>
              </Link>
            );
          })}
        </ul>
      </section>
    );
  }
}

PrimaryResults.propTypes = {
  results: PropTypes.array.isRequired,
  searchState: PropTypes.shape({
    searchYear: PropTypes.string.isRequired,
    primaryIndex: PropTypes.number.isRequired,
  }),
};

const PrimaryResultsContainer = (props) => {
  const { isOpen, results } = props.searchState.primarySearch;

  if (isOpen && results && results.length > 0) {
    return <PrimaryResults {...props} results={results} />;
  }
  return null;
};

PrimaryResultsContainer.propTypes = {
  searchState: PropTypes.shape({
    primaryResults: PropTypes.array.isRequired,
  }).isRequired,
};

export default withRouter(PrimaryResultsContainer);
