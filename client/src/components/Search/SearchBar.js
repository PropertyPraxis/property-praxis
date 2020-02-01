import React, { Component } from "react";
import { CSSTransition } from "react-transition-group";
import "../../scss/SearchBar.scss";

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
          <form className="search-form" >
            <input
              type="text"
              placeholder="Search Property Praxis.."
              name="search"
            ></input>
          </form>
        </div>
        <div className="search-results">search results</div>
      </div>
    );
  }
}

export default SearchBar;
