import React, { Component } from "react";
import { DebounceInput } from "react-debounce-input";
import PropTypes from "prop-types";
import { handleGetYearsAction } from "../../actions/mapData";
import {
  setSearchType,
  setSearchTerm,
  resetSearch,
  setSearchDisplayType,
  handleSearchPartialZipcode,
  handleSearchPartialAddress,
  handleSearchPartialSpeculator,
  handleSearchPartialAll,
} from "../../actions/search";
import {
  togglePartialResultsAction,
  toggleFullResultsAction,
} from "../../actions/results";
import { setMarkerCoordsAction } from "../../actions/mapData";
import { capitalizeFirstLetter, parseSearchResults } from "../../utils/helper";
import PartialSearchResults from "./SearchResults";
import * as searchIcon from "../../assets/img/search.png";
import styleVars from "../../scss/colors.scss";

// use this object to reset to nothing
const resetSearchOptions = {
  searchTerm: "",
  searchDisplayType: "all",
  partialResults: [],
  fullResults: [],
};

class SearchBar extends Component {
  _searchButons = ["all", "address", "speculator", "zipcode"];

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

  _handleInputChange = async (e) => {
    const searchTerm = e.target.value;
    const { searchType, searchYear } = this.props.searchState;

    this.props.dispatch(setSearchTerm(searchTerm));
    this.props.dispatch(setSearchDisplayType("partial"));

    //zipcode search
    if (searchType === "zipcode") {
      this.props.dispatch(handleSearchPartialZipcode(searchTerm, searchYear));
    } else if (searchType === "address") {
      this.props.dispatch(handleSearchPartialAddress(searchTerm, searchYear));
    } else if (searchType === "speculator") {
      this.props.dispatch(
        handleSearchPartialSpeculator(searchTerm, searchYear)
      );
    } else if (searchType === "all") {
      this.props.dispatch(handleSearchPartialAll(searchTerm, searchYear));
    }
  };

  _setSearchParams = (partialSearchResults) => {
    const { searchType, searchYear } = this.props.searchState;
    if (partialSearchResults.length > 0) {
      const route = `/map?${parseSearchResults({
        results: partialSearchResults,
        type: searchType,
        year: searchYear,
      })}`;
      this.props.history.push(route);
    }
  };

  _handleKeyPress = (e) => {
    const { partialResults } = this.props.searchState;
    // if it is an enter key press
    if (e.key === "Enter") {
      this._setSearchParams(partialResults);
    }
  };

  _handleSearchButtonClick = () => {
    const { partialResults } = this.props.searchState;
    this._setSearchParams(partialResults);
  };

  _handleYearSelect = (e) => {
    this.props.dispatch(resetSearch({ searchYear: e.target.value }));
  };

  componentDidMount() {
    // load the available years
    const yearsRoute = "/api/praxisyears";
    this.props.dispatch(handleGetYearsAction(yearsRoute));
  }

  render() {
    const { searchType, searchTerm, searchYear } = this.props.searchState;
    const { years } = this.props.mapData;
    const { searchBarType, showSearchButtons } = this.props;

    if (years) {
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
                {this._searchButons.map((button) => {
                  return (
                    <div
                      key={button}
                      onClick={() => {
                        this.props.dispatch(
                          resetSearch({ ...resetSearchOptions })
                        );
                        this.props.dispatch(setSearchType(button));
                        this.props.dispatch(toggleFullResultsAction(false));
                        this.props.dispatch(setMarkerCoordsAction(null, null));
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
                <select id="years" onChange={this._handleYearSelect}>
                  {years.map((result) => (
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
                  onClick={() => {
                    this.props.dispatch(resetSearch({ ...resetSearchOptions }));
                    this.props.dispatch(setMarkerCoordsAction(null, null));
                  }}
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
                  onChange={this._handleInputChange}
                  onKeyPress={(event) => {
                    //need to update to action
                    event.persist();
                    this._handleKeyPress(event);
                  }}
                  onClick={() => {
                    this.props.dispatch(toggleFullResultsAction(false));
                  }}
                  minLength={1}
                  debounceTimeout={300}
                  inputRef={(ref) => {
                    //create a ref to the input
                    this._textInput = ref;
                  }}
                  onFocus={() => {
                    this.props.dispatch(togglePartialResultsAction(true));
                  }}
                />
                <div
                  className="search-button"
                  onClick={this._handleSearchButtonClick}
                >
                  <img src={searchIcon} alt="search button"></img>
                </div>
              </div>
            </div>
            <PartialSearchResults {...this.props} />
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
    searchTerm: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.oneOf([null]),
    ]),
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default SearchBar;
