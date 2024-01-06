import React, { Component } from "react";
import { DebounceInput } from "react-debounce-input";
import PropTypes from "prop-types";
import {
  handlePrimarySearchQuery,
  handlePrimarySearchAll,
  updateSearchParams,
  updatePrimarySearch,
  updateDetailedSearch,
} from "../../actions/search";
import { URLParamsToSearchParams } from "../../utils/parseURL";
import {
  capitalizeFirstLetter,
  sanitizeSearchResult,
  createQueryStringFromParams,
} from "../../utils/helper";
import PrimaryResultsContainer from "./PrimarySearchResults";
import searchIcon from "../../assets/img/search.png";
import { ppRose } from "../../utils/colors";

class SearchBar extends Component {
  _inputRef = React.createRef();

  /*Passed down to Search Results.
  Changes the browser query string*/
  _setSearchLocationParams = (result) => {
    const { searchYear } = this.props.searchState.searchParams;

    if (result) {
      const route = createQueryStringFromParams(
        sanitizeSearchResult({
          result,
          year: searchYear,
        }),
        "/map"
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
      updateSearchParams({
        searchType,
        searchTerm,
        searchYear,
        searchCoordinates,
      })
    );

    this.props.dispatch(updatePrimarySearch({ results: null, index: 0 }));
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
    if (searchType === "all") {
      this.props.dispatch(
        handlePrimarySearchAll(
          { searchTerm, searchYear },
          `/api/primary-search`
        )
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
          "/api/primary-search"
        )
      );
    }
  };

  _handleOnChange = async (e) => {
    const searchTerm = e.target.value;
    const { searchType, searchYear } = this.props.searchState.searchParams;

    this.props.dispatch(updateSearchParams({ searchTerm }));

    this._handleQueryPrimaryResults({
      searchType,
      searchTerm,
      searchYear,
    });
  };

  _handleOnFocus = () => {
    this.props.dispatch(updatePrimarySearch({ isOpen: true }));
  };

  _handleOnBlur = () => {
    const { isActive } = this.props.searchState.primarySearch;
    if (!isActive) {
      this.props.dispatch(updatePrimarySearch({ isOpen: false }));
    }
  };

  _handleSearchTypeButtonClick = (buttonType) => {
    this.props.dispatch(
      updateSearchParams({
        searchTerm: "",
        searchType: buttonType,
        searchCoordinates: null,
      })
    );

    this.props.dispatch(updatePrimarySearch({ results: null }));
    this.props.dispatch(
      updateDetailedSearch({
        results: null,
        resultsType: null,
        drawerIsOpen: false,
        contentIsVisible: false,
      })
    );
  };

  _handleKeyPress = (e) => {
    const { results, index } = this.props.searchState.primarySearch;
    // if it is an enter key press
    if (e.key === "Enter") {
      if (results && results.length > 0) {
        // set location according to current index selection
        this._setSearchLocationParams(results[index]);
        this.props.dispatch(updatePrimarySearch({ isOpen: false }));

        // blur the input
        this._inputRef.current.blur();
      }
    }
  };

  _handleOnKeyDown = (e) => {
    const { results, index } = this.props.searchState.primarySearch;
    if (e.key === "ArrowDown") {
      if (index < results.length - 1) {
        this.props.dispatch(updatePrimarySearch({ index: index + 1 }));
      }
    }
  };

  _handleOnKeyUp = (e) => {
    const { index } = this.props.searchState.primarySearch;
    if (e.key === "ArrowUp") {
      if (index > 0) {
        this.props.dispatch(updatePrimarySearch({ index: index - 1 }));
      }
    }
  };

  _handleSearchIconClick = () => {
    const { results, index } = this.props.searchState.primarySearch;

    if (results) {
      this._setSearchLocationParams(results[index]);
    } else {
      this._inputRef.current.focus();
    }
  };

  _handleClearIconClick = () => {
    this.props.dispatch(
      updateSearchParams({
        searchTerm: "",
        searchType: "all",
        searchCoordinates: null,
      })
    );
    this.props.dispatch(updatePrimarySearch({ results: null, index: 0 }));
    this.props.dispatch(
      updateDetailedSearch({
        results: null,
        resultsType: null,
        drawerIsOpen: false,
        contentIsVisible: false,
      })
    );
  };

  _handleYearSelect = (e) => {
    this.props.dispatch(updateSearchParams({ searchYear: e.target.value }));
  };

  componentDidMount() {
    // parse URL and dispatch params
    const { search: searchQuery, pathname } = this.props.history.location;
    if (pathname === "/map") {
      const { searchType, searchTerm, searchCoordinates, searchYear } =
        URLParamsToSearchParams(searchQuery);

      this._setSearchStateParams({
        searchType,
        searchTerm,
        searchCoordinates,
        searchYear,
      });
      this._handleQueryPrimaryResults({
        searchType,
        searchTerm,
        searchYear,
      });
    }
  }

  componentDidUpdate(prevProps) {
    // set search if the full query string changes
    const { search: searchQuery, pathname } = this.props.history.location;
    if (prevProps.location.search !== searchQuery && pathname === "/map") {
      // parse URL and dispatch params
      const { searchType, searchTerm, searchYear, searchCoordinates } =
        URLParamsToSearchParams(searchQuery);
      this._setSearchStateParams({
        searchType,
        searchTerm,
        searchYear,
        searchCoordinates,
      });

      this._handleQueryPrimaryResults({
        searchType,
        searchTerm,
        searchYear,
      });
    } else if (prevProps.location.pathname !== pathname) {
      this._setSearchStateParams({
        searchTerm: "",
        searchType: "all",
        searchCoordinates: null,
        searchYear: "2020", //this is hardcoded and can be more dynamic
      });
    }
  }

  render() {
    const { searchType, searchTerm, searchYear } =
      this.props.searchState.searchParams;
    const { searchYears } = this.props.searchState.searchBar;

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
                      style={button === searchType ? { color: ppRose } : null}
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
                  {searchYears.map((result) => {
                    return (
                      <option
                        key={result.praxisyear}
                        selected={result.praxisyear.toString() === searchYear}
                      >
                        {result.praxisyear}
                      </option>
                    );
                  })}
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
                  inputRef={this._inputRef}
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
