import React from "react";
import { Link } from "react-router-dom";
import { getYearString } from "../../utils/helper";

const Footer = () => {
  return (
    <div>
      <footer>
        <div className="footer-container">
          <div>&#169; {getYearString()} | Urban Praxis</div>
          <div>
            <div>A project in collaboration with</div>
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
            <Link to={{ pathname: "/data" }}>
              <li>Download Data</li>
            </Link>
            <Link to={{ pathname: "/methodology" }}>
              <li>Methodology</li>
            </Link>
            <Link to={{ pathname: "/disclaimer" }}>
              <li>Disclaimer</li>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
