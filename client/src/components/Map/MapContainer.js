import React, { Component } from "react";
import { connect } from "react-redux";
import { getMapStateAction } from "../../actions/mapState";
import ReactMapGL, {Source, Layer} from "react-map-gl";

//this token need to be hidden
// const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;
const MAPBOX_TOKEN =
  "pk.eyJ1IjoidGltLWhpdGNoaW5zIiwiYSI6ImNqdmNzODZ0dDBkdXIzeW9kbWRtczV3dDUifQ.29F1kg9koRwGRwjg-vpD6A";
// GeoJSON Data source used in vector tiles, documented at
// https://gist.github.com/ryanbaumann/a7d970386ce59d11c16278b90dde094d

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
    return (
      <ReactMapGL
        {...this.props.mapState}
        ref={reactMap => (this.reactMap = reactMap)}
        width="100vw"
        height="100vh"
        mapStyle="mapbox://styles/tim-hitchins/ck5rden7f01t51in3cizqexql"
        onViewportChange={viewport => {
          this.props.dispatch(getMapStateAction(viewport));
        }}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        onClick={e => {
          console.log("click: ", e);
        }}
      />
    );
  }
}
function mapStateToProps({ mapState, mapData }) {
  return { mapState, mapData };
}
export default connect(mapStateToProps)(MapContainer);
