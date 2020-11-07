import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import {
  togglePrimaryResultsAction,
  togglePrimaryActiveAction,
} from "../../actions/search";
import {
  sanitizeSearchResult,
  createQueryStringFromSearch,
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
    this.props.dispatch(togglePrimaryActiveAction(true));
  };

  _handleOnMouseOut = () => {
    this.props.dispatch(togglePrimaryActiveAction(false));
  };

  _handleOnClick = () => {
    this.props.dispatch(togglePrimaryResultsAction(false));
  };

  componentWillUnmount() {
    // turn active state to true
    this.props.dispatch(togglePrimaryActiveAction(false));
  }

  render() {
    const { searchYear, primaryIndex } = this.props.searchState;
    const { results } = this.props;

    return (
      <section
        className="partial-results-container"
        onMouseOver={this._handleOnMouseOver}
        onMouseOut={this._handleOnMouseOut}
      >
        <ul>
          {results.map((result, index) => {
            const { type, search, coordinates, year } = sanitizeSearchResult({
              result,
              year: searchYear,
            });

            const searchQueryRoute = createQueryStringFromSearch({
              type,
              search,
              coordinates,
              year,
            });

            return (
              <Link key={searchQueryRoute} to={searchQueryRoute}>
                <li
                  className={index % 2 ? "list-item-odd" : "list-item-even"}
                  style={
                    index === primaryIndex
                      ? { backgroundColor: styleVars.uiMedGray }
                      : null
                  }
                  onClick={this._handleOnClick}
                >
                  <img src={primaryResultIcons[type]} alt={`Icon of ${type}`} />
                  {search}
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
  const { isPrimaryResultsOpen, primaryResults } = props.searchState;

  if (isPrimaryResultsOpen && primaryResults && primaryResults.length > 0) {
    return <PrimaryResults {...props} results={primaryResults} />;
  }

  return null;
};

PrimaryResultsContainer.propTypes = {
  searchState: PropTypes.shape({
    primaryResults: PropTypes.array.isRequired,
  }).isRequired,
};

export default withRouter(PrimaryResultsContainer);
