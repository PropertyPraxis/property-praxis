import React, { Component } from "react";
import {
  setSearchType,
  setSearchTerm,
  resetSearchTerm,
  handleSearchPartialZipcode
} from "../../actions/search";
import SearchResults from "./SearchResults";
import "../../scss/Search.scss";
import styleVars from "../../scss/colors.scss";

class SearchBar extends Component {
  _searchButons = ["All", "Address", "Speculator", "Zipcode"];

  _setSearchPlaceholderText = searchType => {
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

  _textInput = React.createRef();

  _handleInputChange = async e => {
    const searchTerm = e.target.value;
    const { searchType } = this.props.searchState;

    this.props.dispatch(setSearchTerm(searchTerm));

    if (searchType === "Zipcode") {
      this.props.dispatch(handleSearchPartialZipcode(searchTerm));
    }
  };

  componentDidMount() {
    // this.props.dispatch(handleSearchZipcode("48214"));
  }

  componentDidUpdate(prevProps) {
    const { searchType } = this.props.searchState;
    // reset the text to '' when the search type changes
    if (prevProps.searchState.searchType !== searchType) {
      this._textInput.current.value = "";
    }
  }
  render() {
    const { searchType } = this.props.searchState;
    return (
      <div className="search-container">
        <div className="search-options">
          {this._searchButons.map(button => {
            return (
              <div
                key={button}
                onClick={() => {
                  this.props.dispatch(resetSearchTerm());
                  this.props.dispatch(setSearchType(button));
                }}
                style={
                  button === searchType ? { color: styleVars.ppGreen } : null
                }
              >
                {button}
              </div>
            );
          })}
        </div>
        <div className="search-bar">
          <form className="search-form">
            <input
              type="text"
              placeholder={this._setSearchPlaceholderText(searchType)}
              name="search"
              onChange={this._handleInputChange}
              ref={this._textInput}
            ></input>
          </form>
        </div>
        <SearchResults />
      </div>
    );
  }
}

export default SearchBar;
