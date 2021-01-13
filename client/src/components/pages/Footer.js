import React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { triggerFetchError } from "../../actions/redirect";
import { getYearString } from "../../utils/helper";

const Footer = () => {
  const { isFetchError } = useSelector((state) => state.redirect);
  const dispatch = useDispatch();

  const hideError = () => {
    if (isFetchError) {
      dispatch(triggerFetchError(false));
    }
  };

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
            <li>
              <Link to={{ pathname: "/data" }} onClick={() => hideError()}>
                Download Data
              </Link>
            </li>

            <li>
              <Link to={{ pathname: "/about" }} onClick={() => hideError()}>
                About the Project
              </Link>
            </li>

            <li>
              <Link
                to={{ pathname: "/methodology" }}
                onClick={() => hideError()}
              >
                Methodology
              </Link>
            </li>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
