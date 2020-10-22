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

const primaryResultIcons = {
  address: mapMarkerIcon,
  speculator: speculatorIcon,
  zipcode: zipcodeIcon,
};

const PrimaryResults = (props) => {
  const { searchYear } = props.searchState;
  const { results } = props;

  return (
    <section>
      <ul className="partial-results-container">
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
              <li className={index % 2 ? "list-item-odd" : "list-item-even"}>
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

const PrimaryResultsContainer = (props) => {
  const { primaryResults } = props.searchState;

  if (primaryResults.length > 0) {
    return <PrimaryResults {...props} results={primaryResults} />;
  }

  return null;
};

export default PrimaryResultsContainer;

// TEST ADDRESS
// 17451 ST LOUIS, Detroit, Michigan 48212
