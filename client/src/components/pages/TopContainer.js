import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { triggerFetchError } from "../../actions/redirect";
import { Link } from "react-router-dom";

const TopContainer = (props) => {
  const { isFetchError } = useSelector((state) => state.redirect);
  const dispatch = useDispatch();

  const hideError = () => {
    if (isFetchError) {
      dispatch(triggerFetchError(false));
    }
  };

  return (
    <div className="top-container">
      <div className="top-logo">
        <Link to={{ pathname: "/" }} onClick={() => hideError()}>
          <img
            src="https://property-praxis-web.s3-us-west-2.amazonaws.com/pp_logo_transparent.png"
            alt="Property Praxis logo"
          ></img>
        </Link>
      </div>

      <div>
        <h1>{props.title}</h1>
      </div>
    </div>
  );
};

export default TopContainer;
