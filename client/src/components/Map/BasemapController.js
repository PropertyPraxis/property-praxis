import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
import { toggleBasemapAction } from "../../actions/controller";
import * as monochromeLayerImage from "../../assets/img/monochrome-layer.png";
import * as satelliteLayerImage from "../../assets/img/satellite-layer.jpg";
import "../../scss/Controller.scss";

const basemapLayers = {
  monochromeDark: "mapbox://styles/mappingaction/ck8agoqtt043l1ik9bvf3v0cv",
  satellite: "mapbox://styles/mappingaction/ck8agtims11p11imzvekvyjvy"
};

class BasemapController extends Component {
  render() {
    return (
      <div className="basemap-controller-container">
        <div
          className="basemap-layer"
          data-tip="Dark"
          onClick={() => {
            this.props.dispatch(
              toggleBasemapAction(basemapLayers.monochromeDark)
            );
          }}
        >
          <img src={monochromeLayerImage} alt="Monochrome Basemap"></img>
        </div>
        <div
        className="basemap-layer"
          data-tip="Satellite"
          onClick={() => {
            this.props.dispatch(toggleBasemapAction(basemapLayers.satellite));
          }}
        >
          <img src={satelliteLayerImage} alt="Satellite Basemap"></img>
        </div>
        <ReactTooltip border={false} />
      </div>
    );
  }
}

export default BasemapController;
