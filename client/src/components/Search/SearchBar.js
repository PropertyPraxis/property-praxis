import React, { Component } from "react";
import SearchResults from "./SearchResults";
import "../../scss/Search.scss";

class SearchBar extends Component {
  render() {
    return (
      <div className="search-container">
        <div className="search-options">
          <div>All</div>
          <div>Address</div>
          <div>Speculator</div>
          <div>Zipcode</div>
        </div>
        <div className="search-bar">
          <form className="search-form">
            <input
              type="text"
              placeholder="Search Property Praxis..."
              name="search"
            ></input>
          </form>
        </div>
        <SearchResults />
      </div>
    );
  }
}

export default SearchBar;
