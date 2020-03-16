import React, { Component } from "react";
import ReactMapGL, { Source, Layer, Marker } from "react-map-gl";
import { createNewViewport } from "../../utils/map";
import { getMapStateAction } from "../../actions/mapState";
import { getHoveredFeatureAction } from "../../actions/currentFeature";
import {
  logMarkerDragEventAction,
  onMarkerDragEndAction
} from "../../actions/mapData";
import {
  parcelLayer,
  parcelHighlightLayer,
  parcelCentroid,
  zipsLayer,
  zipsLabel
} from "./mapStyle";
import Pin from "./Pin";
import "../../scss/Map.scss";

//this token needs to be hidden
// const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;
const MAPBOX_TOKEN =
  "pk.eyJ1IjoidGltLWhpdGNoaW5zIiwiYSI6ImNqdmNzODZ0dDBkdXIzeW9kbWRtczV3dDUifQ.29F1kg9koRwGRwjg-vpD6A";
// GeoJSON Data source used in vector tiles, documented at
// https://gist.github.com/ryanbaumann/a7d970386ce59d11c16278b90dde094d

class PraxisMarker extends React.Component {
  _logDragEvent(name, event) {
    this.props.dispatch(logMarkerDragEventAction(name, event));
  }

  _onMarkerDragStart = event => {
    this._logDragEvent("onDragStart", event);
  };

  _onMarkerDrag = event => {
    this._logDragEvent("onDrag", event);
  };

  _onMarkerDragEnd = event => {
    this._logDragEvent("onDragEnd", event);
    this.props.dispatch(onMarkerDragEndAction(event));
  };

  render() {
    const { latitude, longitude } = this.props.mapData.marker;
    return (
      <Marker
        longitude={longitude}
        latitude={latitude}
        offsetTop={-20}
        offsetLeft={-10}
        draggable
        onDragStart={this._onMarkerDragStart}
        onDrag={this._onMarkerDrag}
        onDragEnd={this._onMarkerDragEnd}
      >
        <Pin size={20} />
      </Marker>
    );
  }
}

class PraxisMap extends Component {
  // // create new vieport dependent on current geojson bbox
  // _createNewViewport = () => {
  //   //check to see what data is loaded
  //   const { ppraxis } = this.props.mapData; //geojson
  //   const { features } = this.props.mapData.ppraxis;
  //   const { mapState } = this.props;

  //   //instantiate new viewport object
  //   const { longitude, latitude, zoom } = createNewViewport(ppraxis, mapState);
  //   const newViewport = {
  //     ...mapState,
  //     longitude,
  //     latitude,
  //     zoom,
  //     transitionDuration: 1000
  //   };
  //   // if the return geojson has features aka the search term was
  //   // valid then change the veiwport accordingly
  //   if (features) {
  //     this.props.dispatch(getMapStateAction(newViewport));
  //   }
  // };

  _onHover = event => {
    const {
      features,
      srcEvent: { offsetX, offsetY }
    } = event;

    const hoveredFeature =
      features && features.find(f => f.layer.id === "parcel-polygon");

    this.props.dispatch(
      getHoveredFeatureAction({ hoveredFeature, x: offsetX, y: offsetY })
    );

    // let highlightFeatureId;
    // if (hoveredFeature) {
    //   highlightFeatureId = hoveredFeature.properties.id;
    //   console.log(highlightFeatureId)
    // }
  };

  _onViewportChange = viewport => {
    console.log("Praxismap");
    this.props.dispatch(getMapStateAction({ ...viewport }));
  };

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

  // _getCursor = ({ isHovering, isDragging }) => {
  //   // return isDragging ? 'pointer' : 'default';
  //   if (isHovering) {
  //     return "pointer";
  //   }
  //   if (isDragging) {
  //     return "hand";
  //   }
  //   return "default";
  // };

  render() {
    //create the new viewport before rendering
    const { latitude, longitude } = this.props.mapData.marker;
    const { hoveredFeature } = this.props.currentFeature;
    const filter = hoveredFeature ? hoveredFeature.properties.feature_id : "";

    return (
      <div className="map">
        <ReactMapGL
          {...this.props.mapState}
          ref={reactMap => (this.reactMap = reactMap)}
          mapStyle="mapbox://styles/tim-hitchins/cjvec50f227zu1gnw0soteeok"
          // mapStyle="mapbox://styles/tim-hitchins/ck5venmuh1fi81io641ps63bw"
          width="100vw"
          height="100vh"
          minZoom={10}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onViewportChange={this._onViewportChange}
          onHover={this._onHover}
          interactiveLayerIds={["parcel-polygon"]}
          // getCursor={this._getCursor}
        >
          {latitude && longitude ? <PraxisMarker {...this.props} /> : null}
          <Source id="parcels" type="geojson" data={this.props.mapData.ppraxis}>
            <Layer key="parcel-centroid" {...parcelCentroid} />
            <Layer key="parcel-layer" {...parcelLayer} />
            <Layer
              key="highlight-parcel-layer"
              {...parcelHighlightLayer}
              filter={["in", "feature_id", filter]}
            />
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
