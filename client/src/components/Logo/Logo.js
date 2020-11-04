import React from "react";
import { Link } from "react-router-dom";

export default function () {
  return (
    <Link to={{ pathname: "/" }}>
      <div className="pp-logo">
        <img
          src="https://property-praxis-web.s3-us-west-2.amazonaws.com/pp_logo_transparent.png"
          alt="Property Praxis Logo"
        ></img>
      </div>
    </Link>
  );
}
