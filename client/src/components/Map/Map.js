import React, { Component } from "react";
import ReactMapGL, { Source, Layer } from "react-map-gl";
import { getMapStateAction } from "../../actions/mapState";
import { getHoveredFeatureAction } from "../../actions/currentFeature";
import {
  parcelLayer,
  parcelCentroid,
  zipsLayer,
  zipsLabel
  // heatmapLayer
} from "./mapStyle";
import "../../scss/Map.scss";

//this token needs to be hidden
// const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;
const MAPBOX_TOKEN =
  "pk.eyJ1IjoidGltLWhpdGNoaW5zIiwiYSI6ImNqdmNzODZ0dDBkdXIzeW9kbWRtczV3dDUifQ.29F1kg9koRwGRwjg-vpD6A";
// GeoJSON Data source used in vector tiles, documented at
// https://gist.github.com/ryanbaumann/a7d970386ce59d11c16278b90dde094d

class PraxisMap extends Component {
  _onHover = event => {
    const {
      features,
      srcEvent: { offsetX, offsetY }
    } = event;
    console.log("event", event);
    const hoveredFeature =
      features && features.find(f => f.layer.id === "parcel-polygon");
    // if (hoveredFeature !== undefined) {
    this.props.dispatch(
      getHoveredFeatureAction({ hoveredFeature, x: offsetX, y: offsetY })
    );
    // }
  };

  //   _sourceRef = React.createRef();

  _onViewportChange = viewport =>
    this.props.dispatch(getMapStateAction({ ...viewport }));

  _renderTooltip() {
    const { hoveredFeature, x, y } = this.props.currentFeature;

    return (
      hoveredFeature && (
        <div className="tooltip" style={{ left: x, top: y }}>
          <div>Speculator: {hoveredFeature.properties.own_id}</div>
          <div>Properties owned: {hoveredFeature.properties.count}</div>
        </div>
      )
    );
  }
  render() {
    // const { zoom } = this.props.mapState;
    // console.log("zoom", zoom);
    return (
      <div className="map">
        <ReactMapGL
          {...this.props.mapState}
          ref={reactMap => (this.reactMap = reactMap)}
          mapStyle="mapbox://styles/tim-hitchins/cjvec50f227zu1gnw0soteeok"
          width="100vw"
          height="100vh"
          minZoom={10}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onViewportChange={this._onViewportChange}
          onClick={e => {
            console.log("click: ", e);
          }}
          onHover={this._onHover}
        >
          <Source id="parcels" type="geojson" data={this.props.mapData.ppraxis}>
            <Layer key="parcel-centroid" {...parcelCentroid} />
            <Layer key="parcel-layer" {...parcelLayer} />
          </Source>
          {this._renderTooltip()}
          <Source id="zips" type="geojson" data={this.props.mapData.zips}>
            <Layer key="zips-layer" {...zipsLayer} />
            <Layer key="zips-label" {...zipsLabel} />
          </Source>
        </ReactMapGL>
      </div>
    );
  }
}

export default PraxisMap;

// _onClick = event => {
//     const feature = event.features[0];
//     const clusterId = feature.properties.id;

//     const mapboxSource = this._sourceRef.current.getSource();

//     mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
//       if (err) {
//         return;
//       }

//       this.props.dispatch(
//         getMapStateAction({
//           //   ...viewport,
//           ...this.props.mapState,
//           longitude: feature.geometry.coordinates[0],
//           latitude: feature.geometry.coordinates[1],
//           zoom,
//           transitionDuration: 500
//         })
//       );
//     });
//   };

// onViewportChange={this._onViewportChange}
// interactiveLayerIds={[clusterLayer.id]}
//   data="https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson"
//   cluster={true}
//   clusterMaxZoom={20}
//   clusterRadius={5}
//   ref={this._sourceRef}
// <Layer {...clusterLayer} />
// <Layer {...clusterCountLayer} />
// <Layer {...unclusteredPointLayer} />
