import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
  capitalizeFirstLetter,
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
  const { results, typeTitle } = props;
  return (
    <section>
      <>
        <div className="partial-results-all-title">{`${capitalizeFirstLetter(
          typeTitle
        )} Results`}</div>
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
      </>
    </section>
  );
};

const PrimaryResultsContainer = (props) => {
  const { searchType, primaryResults } = props.searchState;

  if (primaryResults.length > 0) {
    if (searchType === "all" && primaryResults.length > 0) {
      const searchTypes = ["address", "speculator", "zipcode"];

      return searchTypes.map((typeTitle, index) => (
        <PrimaryResults
          {...props}
          results={primaryResults[index]}
          typeTitle={typeTitle}
        />
      ));
    } else {
      return (
        <PrimaryResults
          {...props}
          results={primaryResults}
          typeTitle={searchType}
        />
      );
    }
  }

  return null;
};

export default PrimaryResultsContainer;

// TEST ADDRESS
// 17451 ST LOUIS, Detroit, Michigan 48212
