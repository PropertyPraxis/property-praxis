import React, { Component } from "react";
import { connect } from "react-redux";
import PraxisMap from "./Map";

//this token needs to be hidden
// const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

class MapContainer extends Component {
  zipcodeFillLayer = {
    id: "zicode-fill",
    type: "fill",
    source: {
      type: "geojson",
      data: this.props.mapData
    }
  };

  zipcodeLineLayer = {
    id: "zicode-fill",
    type: "line",
    source: {
      type: "geojson",
      data: this.props.mapData
    }
  };

  componentDidMount() {
    // const map = this.reactMap.getMap();
    // let hoveredStateId = null;
    // map.on("load", () => {
    //   map.addSource("zipcode", {
    //     type: "geojson",
    //     data: this.props.mapData
    //   });
    //   map.addLayer({
    //     id: "zipcode-fill",
    //     type: "fill",
    //     source: "zipcode",
    //     layout: {},
    //     paint: {
    //       "fill-color": "#088",
    //       "fill-opacity": 0.5
    //       // "fill-outline-color": "hsl(0, 53%, 100%)"
    //     }
    //   });
    //   map.addLayer({
    //     id: "zipcode-line",
    //     type: "line",
    //     source: "zipcode",
    //     layout: {},
    //     paint: {
    //       "line-color": "#627BC1",
    //       "line-width": 2
    //     }
    //   });
    // });
  }

  render() {
    return <PraxisMap {...this.props} />;
  }
}
function mapStateToProps({ mapState, mapData, currentFeature }) {
  return { mapState, mapData, currentFeature };
}
export default connect(mapStateToProps)(MapContainer);
