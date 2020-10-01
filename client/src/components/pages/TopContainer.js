import React from "react";
import { Link } from "react-router-dom";

const TopContainer = (props) => {
  return (
    <div className="top-container">
      <Link to={{ pathname: "/" }}>
        <div className="top-logo">
          <img
            src="https://property-praxis-web.s3-us-west-2.amazonaws.com/pp_logo_transparent.png"
            alt="Property Praxis logo"
          ></img>
        </div>
      </Link>
      <div>
        <h1>{props.title}</h1>
      </div>
    </div>
  );
};

export default TopContainer;
