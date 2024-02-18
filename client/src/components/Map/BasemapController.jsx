import React from "react"
import { Tooltip as ReactTooltip } from "react-tooltip"
import PropTypes from "prop-types"
import { toggleBasemapAction } from "../../actions/controller"
import monochromeLayerImage from "../../assets/img/monochrome-layer.png"
import satelliteLayerImage from "../../assets/img/satellite-layer.jpg"

const basemapLayers = {
  monochromeDark: "mapbox://styles/mappingaction/ck8agoqtt043l1ik9bvf3v0cv",
  satellite: "mapbox://styles/mappingaction/ck8agtims11p11imzvekvyjvy",
}

const BasemapController = (props) => {
  return (
    <div className="basemap-controller-container">
      <div
        className="basemap-layer"
        data-tip="Dark"
        onClick={() => {
          props.dispatch(toggleBasemapAction(basemapLayers.monochromeDark))
        }}
      >
        <img src={monochromeLayerImage} alt="Monochrome Basemap"></img>
      </div>
      <div
        className="basemap-layer"
        data-tip="Satellite"
        onClick={() => {
          props.dispatch(toggleBasemapAction(basemapLayers.satellite))
        }}
      >
        <img src={satelliteLayerImage} alt="Satellite Basemap"></img>
      </div>
      <ReactTooltip border={false} />
    </div>
  )
}

BasemapController.propTypes = {
  dispatch: PropTypes.func.isRequired,
}

export default BasemapController
