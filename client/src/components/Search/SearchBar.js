import React, { Component } from "react";
import { DebounceInput } from "react-debounce-input";
import PropTypes from "prop-types";
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
import PartialSearchResults from "./SearchResults";
import * as searchIcon from "../../assets/img/search.png";
import "../../scss/Search.scss";
import styleVars from "../../scss/colors.scss";

// use this object to reset to nothing
const resetSearchOptions = {
  searchTerm: "",
  searchDisplayType: null,
  partialResults: [],
  fullResults: [],
};

class SearchBar extends Component {
  _searchButons = ["All", "Address", "Speculator", "Zipcode"];

  _setSearchPlaceholderText = (searchType) => {
    switch (searchType) {
      case "All":
        return "Search Property Praxis...";
      case "Address":
        return "Search Adresses...";
      case "Speculator":
        return "Search Speculators...";
      case "Zipcode":
        return "Search Zipcodes...";
      default:
        return "Search Property Praxis...";
    }
  };

  _handleInputChange = async (e) => {
    const searchTerm = e.target.value;
    const { searchType } = this.props.searchState;
    const { year } = this.props.mapData;

    this.props.dispatch(setSearchTerm(searchTerm));
    this.props.dispatch(setSearchDisplayType("partial"));

    //zipcode search
    if (searchType === "Zipcode") {
      this.props.dispatch(handleSearchPartialZipcode(searchTerm, year));
    }
    if (searchType === "Address") {
      this.props.dispatch(handleSearchPartialAddress(searchTerm, year));
    }
    if (searchType === "Speculator") {
      this.props.dispatch(handleSearchPartialSpeculator(searchTerm, year));
    }
    if (searchType === "All") {
      this.props.dispatch(handleSearchPartialAll(searchTerm, year));
    }
  };

  // STILL WORKING ON THIS
  _handleKeyPress = async (e) => {
    const { searchType, searchTerm } = this.props.searchState;
    const { year } = this.props.mapData;
    const { key } = e;

    // if it is an enter hit
    if (key === "Enter") {
      console.log("Enter press", this._textInput.value);
      // //zipcode search
      // if (searchType === "Zipcode") {
      //   this.props.dispatch(handleSearchPartialZipcode(searchTerm, year));
      // }
      // if (searchType === "Address") {
      //   this.props.dispatch(handleSearchPartialAddress(searchTerm, year));
      // }
      // if (searchType === "Speculator") {
      //   this.props.dispatch(handleSearchPartialSpeculator(searchTerm, year));
      // }
      // if (searchType === "All") {
      // }
    }
  };

  componentDidUpdate(prevProps) {
    const { searchType } = this.props.searchState;
    // reset the text to '' when the search type changes
    if (prevProps.searchState.searchType !== searchType) {
      // this.props.dispatch(setSearchTerm(""));
      this._textInput.value = "";
    }
  }
  render() {
    const { searchType, searchTerm } = this.props.searchState;
    const { searchBarType } = this.props;
    const searchRoute = `/${searchType.toLowerCase()}`;

    return (
      <section
        className={
          searchBarType === "grid-item"
            ? "search-grid-item"
            : "search-modal-item"
        }
      >
        <div className="search-container">
          <div className="search-options">
            {this._searchButons.map((button) => {
              return (
                <div
                  key={button}
                  onClick={() => {
                    this.props.dispatch(resetSearch({ ...resetSearchOptions }));
                    this.props.dispatch(setSearchType(button));
                    this.props.dispatch(toggleFullResultsAction(false));
                    this.props.dispatch(setMarkerCoordsAction(null, null));
                  }}
                  style={
                    button === searchType ? { color: styleVars.ppRose } : null
                  }
                >
                  {button}
                </div>
              );
            })}
          </div>
          <div className="search-bar">
            <div className="search-form">
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
                placeholder={this._setSearchPlaceholderText(searchType)}
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
                onClick={() => {
                  console.log("clicked");
                }}
              >
                <img src={searchIcon} alt="search button"></img>
              </div>
            </div>
          </div>
          <PartialSearchResults
            // _textInput={this._textInput}
            {...this.props}
            // handleInputChange={this._handleInputChange}
          />
        </div>
      </section>
    );
  }
}

SearchBar.propTypes = {
  searchBarType: PropTypes.string.isRequired,
  searchState: PropTypes.shape({
    searchType: PropTypes.string.isRequired,
    searchTerm: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.oneOf([null]),
    ]),
  }).isRequired,
  mapData: PropTypes.shape({
    year: PropTypes.string.isRequired,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default SearchBar;
