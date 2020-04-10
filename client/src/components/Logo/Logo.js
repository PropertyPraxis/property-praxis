import React from "react";
import * as ppLogo from "../../assets/img/pp-logo.png";
import "../../scss/Logo.scss";

export default function () {
  return (
    <div className="pp-logo">
      <img src={ppLogo} alt="Property Praxis Logo"></img>
    </div>
  );
}
