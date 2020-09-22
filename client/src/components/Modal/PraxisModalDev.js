import React from "react";
import { connect } from "react-redux";
import { BrowserRouter as Router, Route } from "react-router-dom";
import PropTypes from "prop-types";
import SearchBar from "../Search/SearchBar";
import { getYearString } from "../../utils/helper";
import "../../scss/Modal.scss";

const PraxisModalDev = (props) => {
  return (
    <main className="home-container">
      <div className="header-container">
        <div className="home-logo-container">
          <div className="home-logo">
            <img
              src="https://property-praxis-web.s3-us-west-2.amazonaws.com/pp_logo_transparent.png"
              alt="Property Praxis logo"
            ></img>
          </div>
          <header>Welcome to Property Praxis</header>
        </div>
        <div className="home-search-container">
          <Router>
            <SearchBar searchBarType="modal-item" {...props} />
          </Router>
        </div>
      </div>
      <div>
        <div className="home-general-search-container">
          <aside>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
            eget eros sed augue porta aliquam non sit amet felis. Ut interdum
            elit a tristique ornare. Curabitur elementum, nunc quis suscipit
            porta, enim elit vulputate arcu, vel elementum orci turpis id est.
            Ut facilisis neque quis imperdiet congue. Praesent vitae cursus
            arcu. Suspendisse ut vulputate tortor, nec aliquam ante. Aenean sit
            amet rutrum sapien. Sed non velit consectetur, malesuada dolor eget,
            bibendum diam. Aliquam vel tincidunt dui. Vivamus ullamcorper
            maximus dictum.
          </aside>
          <aside>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
            eget eros sed augue porta aliquam non sit amet felis. Ut interdum
            elit a tristique ornare. Curabitur elementum, nunc quis suscipit
            porta, enim elit vulputate arcu, vel elementum orci turpis id est.
            Ut facilisis neque quis imperdiet congue. Praesent vitae cursus
            arcu. Suspendisse ut vulputate tortor, nec aliquam ante. Aenean sit
            amet rutrum sapien. Sed non velit consectetur, malesuada dolor eget,
            bibendum diam. Aliquam vel tincidunt dui. Vivamus ullamcorper
            maximus dictum.
          </aside>
          <aside>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
            eget eros sed augue porta aliquam non sit amet felis. Ut interdum
            elit a tristique ornare. Curabitur elementum, nunc quis suscipit
            porta, enim elit vulputate arcu, vel elementum orci turpis id est.
            Ut facilisis neque quis imperdiet congue. Praesent vitae cursus
            arcu. Suspendisse ut vulputate tortor, nec aliquam ante. Aenean sit
            amet rutrum sapien. Sed non velit consectetur, malesuada dolor eget,
            bibendum diam. Aliquam vel tincidunt dui. Vivamus ullamcorper
            maximus dictum.
          </aside>
        </div>
      </div>
      <div>
        <footer>
          <div className="footer-container">
            <div>&#169; {getYearString()} | Urban Praxis Workshop</div>
            <div>
              A project in collaboration with
              <a
                href="https://urbanpraxis.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://property-praxis-web.s3-us-west-2.amazonaws.com/mac-logo-no-map.png"
                  alt="Mapping Action Collective Logo"
                ></img>
              </a>
            </div>
            <div>
              <li>Download Data</li>
              <li>Methodology</li>
              <li>About</li>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
};

PraxisModalDev.propTypes = {};

function mapStateToProps({ searchState, mapData, mapState, results }) {
  return { searchState, mapData, mapState, results };
}

export default connect(mapStateToProps)(PraxisModalDev);

/* <a
href="https://urbanpraxis.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://property-praxis-web.s3-us-west-2.amazonaws.com/urban-praxis.jpg"
                  alt="Urban Praxis Workshop Logo"
                ></img>
              </a> */
