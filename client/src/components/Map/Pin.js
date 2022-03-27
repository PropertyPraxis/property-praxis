import React, { PureComponent } from "react";
import PropTypes from "prop-types";

const ICON = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z`;

const pinStyle = {
  fill: "#e4002c",
  stroke: "none",
};

export class Pin extends PureComponent {
  render() {
    const { size = 20 } = this.props;

    return (
      <svg height={size} viewBox="0 0 24 24" style={pinStyle}>
        <path d={ICON} />
      </svg>
    );
  }
}

const arrowStyle = {
  fill: "#e4002c",
  stroke: "none",
  transform: `rotate(90deg)`,
};

export function Arrow(props) {
  const { size = 20 } = props;

  return (
    // <svg height={size} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    //   <path
    //     d="m26.934 28.641-10-26a1 1 0 0 0-1.868 0l-10 26A1 1 0 0 0 6.6 29.8l9.4-7.05 9.4 7.05a1 1 0 0 0 1.533-1.159z"
    //     // style="fill:#262628"
    //     style={arrowStyle}
    //     data-name="Arrow GPS"
    //   />
    // </svg>
    <svg
      style={{ transform: `rotate(90deg)` }}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
    >
      <path
        d="m26.934 28.641-10-26a1 1 0 0 0-1.868 0l-10 26A1 1 0 0 0 6.6 29.8l9.4-7.05 9.4 7.05a1 1 0 0 0 1.533-1.159z"
        style={{ fill: "blue" }}
        data-name="Arrow GPS"
      />
    </svg>
  );
}

Pin.propTypes = {
  size: PropTypes.number.isRequired,
};
