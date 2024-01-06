import React from "react";
import { Link } from "react-router-dom";
import logoTransparent from "../../assets/img/pp_logo_transparent.png";

export default function Logo() {
  return (
    <Link to={{ pathname: "/" }}>
      <div className="pp-logo">
        <img src={logoTransparent} alt="Property Praxis Logo"></img>
      </div>
    </Link>
  );
}
