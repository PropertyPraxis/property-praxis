import React from "react";
import { connect } from "react-redux";
import { BrowserRouter as Router, Link } from "react-router-dom";
import PropTypes from "prop-types";
import SearchBar from "../Search/SearchBar";
import { getYearString } from "../../utils/helper";

const Home = (props) => {
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
          <header>Explore Yearly Speculation in Detroit</header>
        </div>
        <div className="home-search-container">
          <Router>
            <SearchBar
              searchBarType="modal-item"
              showSearchButtons={false}
              {...props}
            />
          </Router>
        </div>
      </div>
      <div>
        <div className="home-general-search-container">
          <aside>
            <h2>Who are the worst speculators?</h2>
            <img
              src="https://property-praxis-web.s3-us-west-2.amazonaws.com/noun_marketing_real+estate_2.svg"
              alt="An illustration of an investor"
            ></img>
            <p>
              Explore by zipcode or address to reveal who the top speculators in
              your area are.
            </p>
          </aside>
          <aside>
            <h2>What properties does a speculator own?</h2>
            <img
              src="https://property-praxis-web.s3-us-west-2.amazonaws.com/noun_marketing_real_estate.svg"
              alt="An illustration of a speculator"
            ></img>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
              eget eros sed augue porta aliquam non sit amet felis. Ut interdum
              elit a tristique ornare. Curabitur elementum, nunc quis suscipit
              porta, enim elit vulputate arcu, vel elementum orci turpis id est.
              Ut facilisis neque quis imperdiet congue.
            </p>
          </aside>
          <aside>
            <h2>Does a speculator own my property?</h2>
            <img
              src="https://property-praxis-web.s3-us-west-2.amazonaws.com/noun_Landlord_Tenant.svg"
              alt="An illustration of hands passing a key to another hand"
            ></img>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
              eget eros sed augue porta aliquam non sit amet felis. Ut interdum
              elit a tristique ornare. Curabitur elementum, nunc quis suscipit
              porta, enim elit vulputate arcu, vel elementum orci turpis id est.
              Ut facilisis neque quis imperdiet congue.
            </p>
          </aside>
        </div>
      </div>
      <div>
        <footer>
          <div className="footer-container">
            <div>&#169; {getYearString()} | Urban Praxis</div>
            <div>
              A project in collaboration with
              <a
                href="https://mappingaction.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://property-praxis-web.s3-us-west-2.amazonaws.com/mac_logo_transparent.png"
                  alt="Mapping Action Collective Logo"
                ></img>
              </a>
            </div>
            <div className="footer-links">
              <li>Download Data</li>
              <li>Methodology</li>
              <li>Disclaimer</li>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
};

Home.propTypes = {
  searchState: PropTypes.object.isRequired,
  mapData: PropTypes.object.isRequired,
  mapState: PropTypes.object.isRequired,
  results: PropTypes.object.isRequired,
  dipatch: PropTypes.func.isRequired,
};

function mapStateToProps({ searchState, mapData, mapState, results }) {
  return { searchState, mapData, mapState, results };
}

export default connect(mapStateToProps)(Home);
