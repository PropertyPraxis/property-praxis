import React, { Component } from "react";
import Slider from "react-rangeslider";
import {
  setSliderValueAction,
  setParcelFilterAction
} from "../../actions/controller";
import "react-rangeslider/lib/index.css";
import * as styleVars from "../../scss/colors.scss";
import "../../scss/Controller.scss";

class ParcelLayerController extends Component {
  _getColors = styles => {
    return styles.filter(style => style[0].indexOf("parcelStop") > -1);
  };

  render() {
    const { sliderValue, filter } = this.props.controller;
    const parcelColors = this._getColors(Object.entries(styleVars));
    const labels = ["10-20", "100", "200", "500", "1000", "1500", "2000"];
    return (
      <div className="parcel-layer-controller-container">
        <div className="parcel-layer-palette-labels">
          {labels.map(label => {
            return <div key={label}>{label}</div>;
          })}
        </div>
        <div className="parcel-layer-palette">
          {parcelColors.map((color, index) => {
            return (
              <div
                key={color}
                title={labels[index]}
                style={
                  filter.indexOf(labels[index]) === -1
                    ? { backgroundColor: color[1] }
                    : { backgroundColor: styleVars.uiLightGray }
                }
                onClick={event => {
                  event.preventDefault();
                  this.props.dispatch(
                    setParcelFilterAction(event.target.title)
                  );
                }}
              ></div>
            );
          })}
        </div>
        <div className="slider-horizontal">
          <Slider
            value={sliderValue}
            min={0}
            max={100}
            orientation="horizontal"
            onChange={value => {
              this.props.dispatch(setSliderValueAction(value));
            }}
          />
        </div>
      </div>
    );
  }
}

export default ParcelLayerController;
