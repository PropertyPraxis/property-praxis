import React, { Component } from "react";
import { DebounceInput } from "react-debounce-input";
import PropTypes from "prop-types";
import {
  resetSearch,
  handlePrimarySearchQuery,
  handlePrimarySearchAll,
  updatePrimaryIndex,
} from "../../actions/search";
import { parseURLParams } from "../../utils/parseURL";
import {
  capitalizeFirstLetter,
  sanitizeSearchResult,
  createQueryStringFromSearch,
} from "../../utils/helper";
import PrimaryResultsContainer from "./PrimarySearchResults";
import * as searchIcon from "../../assets/img/search.png";
import styleVars from "../../scss/colors.scss";

// use this object to reset
const resetSearchOptions = {
  searchTerm: "",
  searchType: "all",
  searchCoordinates: null,
  primaryResults: null,
  primaryIndex: 0,
  detailedResults: null,
  searchDisplayType: null,
};

const primarySearchRoutes = {
  address: `/api/address-search/partial/`,
  speculator: `/api/speculator-search/partial/`,
  zipcode: `/api/zipcode-search/partial/`,
};

class SearchBar extends Component {
  /*Passed down to Search Results.
  Changes the URL query*/
  _setSearchLocationParams = (result) => {
    const { searchYear } = this.props.searchState;
    if (result) {
      const route = createQueryStringFromSearch(
        sanitizeSearchResult({
          result,
          year: searchYear,
        })
      );
      this.props.history.push(route);
    }
  };

  _setSearchStateParams = ({
    searchType,
    searchTerm,
    searchYear,
    searchCoordinates,
  }) => {
    this.props.dispatch(
      resetSearch({
        searchType,
        searchTerm,
        searchYear,
        searchCoordinates, //only set when type==="address"
        primaryResults: null,
        primaryIndex: 0,
      })
    );
  };

  _setSearchPlaceholderText = (searchType) => {
    switch (searchType) {
      case "all":
        return "Search Property Praxis...";
      case "address":
        return "Search Adresses...";
      case "speculator":
        return "Search Speculators...";
      case "zipcode":
        return "Search Zipcodes...";
      case "home":
        return "Search for an address, speculator, or zipcode...";
      default:
        return "Search Property Praxis...";
    }
  };

  _handleQueryPrimaryResults = ({ searchType, searchTerm, searchYear }) => {
    const { address, speculator, zipcode } = primarySearchRoutes;

    if (searchType === "all") {
      this.props.dispatch(
        handlePrimarySearchAll({ searchTerm, searchYear }, [
          address,
          speculator,
          zipcode,
        ])
      );
    } else {
      // search type address, speculator, or zipcode
      this.props.dispatch(
        handlePrimarySearchQuery(
          {
            searchType,
            searchTerm,
            searchYear,
          },
          primarySearchRoutes[searchType]
        )
      );
    }
  };

  _handleOnChange = async (e) => {
    const searchTerm = e.target.value;
    const {
      searchType,
      searchCoordinates,
      searchYear,
    } = this.props.searchState;

    this.props.dispatch(resetSearch({ searchTerm }));
    this._handleQueryPrimaryResults({
      searchType,
      searchTerm,
      searchYear,
    });
  };

  _handleOnFocus = () => {
    const { searchTerm, searchType, searchYear } = this.props.searchState;
    this._handleQueryPrimaryResults({
      searchType,
      searchTerm,
      searchYear,
    });
  };

  _handleOnBlur = () => {
    // logic needed
  };

  _handleSearchTypeButtonClick = (buttonType) => {
    this.props.dispatch(
      resetSearch({
        searchTerm: "",
        searchType: buttonType,
        searchCoordinates: null,
        primaryResults: null,
        detailedResults: null,
      })
    );
  };

  _handleKeyPress = (e) => {
    const { primaryResults, primaryIndex } = this.props.searchState;
    // if it is an enter key press
    if (e.key === "Enter") {
      // the index value here will need to be changed to be more dynamic
      this._setSearchLocationParams(primaryResults[primaryIndex]);
    }
  };

  _handleOnKeyDown = (e) => {
    const { primaryIndex, primaryResults } = this.props.searchState;
    if (e.key === "ArrowDown") {
      if (primaryIndex < primaryResults.length - 1) {
        this.props.dispatch(updatePrimaryIndex(primaryIndex + 1));
      }
    }
  };

  _handleOnKeyUp = (e) => {
    const { primaryIndex } = this.props.searchState;
    if (e.key === "ArrowUp") {
      if (primaryIndex > 0) {
        this.props.dispatch(updatePrimaryIndex(primaryIndex - 1));
      }
    }
  };

  _handleSearchIconClick = () => {
    const { primaryResults, primaryIndex } = this.props.searchState;
    this._setSearchLocationParams(primaryResults[primaryIndex]);
  };

  _handleClearIconClick = () => {
    this.props.dispatch(resetSearch(resetSearchOptions));
  };

  _handleYearSelect = (e) => {
    this.props.dispatch(resetSearch({ searchYear: e.target.value }));
  };

  _handleYearSelectFocus = () => {
    this.props.dispatch(resetSearch({ primaryResults: null }));
  };
  componentDidMount() {
    // parse URL and dispatch params
    const { search: searchQuery, pathname } = this.props.history.location;

    if (pathname === "/map") {
      const {
        searchType,
        searchTerm,
        searchCoordinates,
        searchYear,
      } = parseURLParams(searchQuery);
      this._setSearchStateParams({
        searchType,
        searchTerm,
        searchCoordinates,
        searchYear,
      });
    }
  }

  componentDidUpdate(prevProps) {
    // set search if the full query string changes
    const { search: searchQuery, pathname } = this.props.history.location;
    if (prevProps.location.search !== searchQuery && pathname === "/map") {
      // parse URL and dispatch params
      const {
        searchType,
        searchTerm,
        searchYear,
        searchCoordinates,
      } = parseURLParams(searchQuery);
      this._setSearchStateParams({
        searchType,
        searchTerm,
        searchYear,
        searchCoordinates,
      });
    }
  }

  render() {
    const {
      searchType,
      searchTerm,
      searchYear,
      searchYears,
    } = this.props.searchState;
    const { searchBarType, showSearchButtons } = this.props;

    if (searchYears) {
      return (
        <section
          className={
            searchBarType === "grid-item"
              ? "search-grid-item"
              : "search-modal-item"
          }
        >
          <div className="search-container">
            {showSearchButtons ? (
              <div className="search-options">
                {["all", "address", "speculator", "zipcode"].map((button) => {
                  return (
                    <div
                      key={button}
                      onClick={() => {
                        this._handleSearchTypeButtonClick(button);
                      }}
                      style={
                        button === searchType
                          ? { color: styleVars.ppRose }
                          : null
                      }
                    >
                      {capitalizeFirstLetter(button)}
                    </div>
                  );
                })}
              </div>
            ) : null}

            <div className="search-bar">
              <div className="year-select">
                <select
                  id="years"
                  onChange={this._handleYearSelect}
                  onFocus={this._handleYearSelectFocus}
                >
                  {searchYears.map((result) => (
                    <option
                      key={result.praxisyear}
                      selected={result.praxisyear.toString() === searchYear}
                    >
                      {result.praxisyear}
                    </option>
                  ))}
                </select>
              </div>
              <div
                className={
                  showSearchButtons ? "search-form" : "search-form-home"
                }
              >
                <div
                  className="clear-button"
                  onClick={this._handleClearIconClick}
                >
                  &times;
                </div>
                <DebounceInput
                  type="text"
                  size="1"
                  placeholder={
                    showSearchButtons
                      ? this._setSearchPlaceholderText(searchType)
                      : this._setSearchPlaceholderText("home")
                  }
                  value={searchTerm} //controlled input
                  minLength={1}
                  debounceTimeout={300}
                  onChange={this._handleOnChange}
                  onKeyPress={(event) => {
                    event.persist();
                    this._handleKeyPress(event);
                  }}
                  onKeyDown={this._handleOnKeyDown}
                  onKeyUp={this._handleOnKeyUp}
                  onFocus={this._handleOnFocus}
                  onBlur={this._handleOnBlur}
                />
                <div
                  className="search-button"
                  onClick={this._handleSearchIconClick}
                >
                  <img src={searchIcon} alt="search button"></img>
                </div>
              </div>
            </div>
            <PrimaryResultsContainer {...this.props} />
          </div>
        </section>
      );
    }

    return null;
  }
}

SearchBar.propTypes = {
  searchBarType: PropTypes.string.isRequired,
  showSearchButtons: PropTypes.bool.isRequired,
  searchState: PropTypes.shape({
    searchType: PropTypes.string.isRequired,
    searchTerm: PropTypes.string.isRequired,
    searchYear: PropTypes.string.isRequired,
    searchYears: PropTypes.oneOf([null, PropTypes.array]).isRequired,
  }),
  dispatch: PropTypes.func.isRequired,
};

export default SearchBar;
