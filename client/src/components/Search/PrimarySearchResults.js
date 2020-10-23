import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
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

const PrimaryResults = (props) => {
  const { searchYear, primaryIndex } = props.searchState;
  const { results } = props;

  return (
    <section className="partial-results-container">
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
};

PrimaryResults.propTypes = {
  results: PropTypes.array.isRequired,
  searchState: PropTypes.shape({
    searchYear: PropTypes.string.isRequired,
    primaryIndex: PropTypes.number.isRequired,
  }),
};

const PrimaryResultsContainer = (props) => {
  const { primaryResults } = props.searchState;

  if (primaryResults.length > 0) {
    return <PrimaryResults {...props} results={primaryResults} />;
  }

  return null;
};

PrimaryResultsContainer.propTypes = {
  searchState: PropTypes.shape({
    primaryResults: PropTypes.array.isRequired,
  }).isRequired,
};

export default PrimaryResultsContainer;
