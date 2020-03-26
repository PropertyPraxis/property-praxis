import React, { Component } from "react";
import ReactMapGL, { Source, Layer, Marker } from "react-map-gl";
import { createNewViewport } from "../../utils/map";
import { createAddressString } from "../../utils/helper";
import { getMapStateAction } from "../../actions/mapState";
import { getHoveredFeatureAction } from "../../actions/currentFeature";
import {
  handleSearchPartialAddress,
  resetSearch,
  setSearchType,
  setSearchDisplayType
} from "../../actions/search";
import {
  logMarkerDragEventAction,
  onMarkerDragEndAction,
  setMarkerCoordsAction,
  dataIsLoadingAction
} from "../../actions/mapData";
import { handleGetParcelsByQueryAction } from "../../actions/mapData";
import {
  handleGetViewerImageAction,
  handleGetDownloadDataAction,
  toggleFullResultsAction,
  togglePartialResultsAction
} from "../../actions/results";
import {
  parcelLayer,
  parcelHighlightLayer,
  parcelCentroid,
  zipsLayer,
  zipsLabel
} from "./mapStyle";
import Pin from "./Pin";
// import { ReactComponent as ArrowIcon } from "../../assets/img/map-arrow-icon.svg";
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
    //change the window url

    //then do stuff with the new coords
    const [longitude, latitude] = event.lngLat;
    const { year } = this.props.mapData;
    const encodedCoords = encodeURI(
      JSON.stringify({
        longitude: longitude,
        latitude: latitude
      })
    );

    const route = `http://localhost:5000/api/geojson/parcels/address/${encodedCoords}/${year}`;
    // query the parcels
    this.props.dispatch(handleGetParcelsByQueryAction(route)).then(geojson => {
      //from praxis map
      this.props.createNewViewport(geojson);

      if (
        geojson.features.length === 1 &&
        geojson.features[0].properties.distance === 0
      ) {
        const {
          propno,
          propstr,
          propdir,
          propzip
        } = geojson.features[0].properties;

        //build the address string
        const addressString = createAddressString(
          propno,
          propdir,
          propstr,
          propzip
        );
        const state = null;
        const title = "";
        const newUrl = `/address?search=${encodeURI(
          addressString
        )}&coordinates=${encodedCoords}`;

        //change the url
        window.history.pushState(state, title, newUrl);
        // change the partial results
        this.props
          .dispatch(handleSearchPartialAddress(addressString, year))
          .then(json => {
            // set the search term to the first result of geocoder
            const proxySearchTerm = json[0].mb[0].place_name;
            this.props.dispatch(
              resetSearch({
                searchTerm: proxySearchTerm
              })
            );
          });
      }
      //get viewer image
      // this.props.dispatch(handleGetViewerImageAction(longitude, latitude));

      //handle all the download data and setting search
      this.props.dispatch(dataIsLoadingAction(true));
      const downloadDataRoute = `/api/address-search/download/${encodedCoords}/${year}`;
      this.props.dispatch(handleGetDownloadDataAction(downloadDataRoute));

      this.props.dispatch(dataIsLoadingAction(false));
      //set the display type to address
      this.props.dispatch(setSearchType("Address"));
      this.props.dispatch(setSearchDisplayType("single-address"));
      this.props.dispatch(toggleFullResultsAction(true));
      this.props.dispatch(togglePartialResultsAction(false));
    });

    // set the image viewer regardless
    this.props.dispatch(handleGetViewerImageAction(longitude, latitude));
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

// class NavigationMarker extends Component {}

class PraxisMap extends Component {
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
  };

  _onViewportChange = viewport => {
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

  //THIS METHOD IS A DUPLICATE OF THE ONE IN APP
  // create new vieport dependent on current geojson bbox
  _createNewViewport = geojson => {
    //check to see what data is loaded
    const { year } = this.props.mapData;
    const features = geojson.features;
    const { mapState } = this.props;
    //instantiate new viewport object
    const { longitude, latitude, zoom } = createNewViewport(geojson, mapState);
    const newViewport = {
      ...mapState,
      longitude,
      latitude,
      zoom,
      transitionDuration: 1000
    };

    // if the return geojson has features aka the search term was
    // valid then change the veiwport accordingly
    features
      ? this.props.dispatch(getMapStateAction(newViewport))
      : this.props.dispatch(
          handleGetParcelsByQueryAction(`/api/geojson/parcels/${year}`)
        );
  };

  // add a new marker if user clicks on a parcel features
  // nothing happens if there is no feature
  _handleMapClick(event) {
    const { hoveredFeature } = this.props.currentFeature;

    if (hoveredFeature) {
      const { propno, propstr, propdir, propzip } = hoveredFeature.properties;

      const [longitude, latitude] = event.lngLat;
      // set the marker
      this.props.dispatch(setMarkerCoordsAction(latitude, longitude));
      // this.props.dispatch(handleGetViewerImageAction(longitude, latitude));
      //set the parcels within buffer
      const { year } = this.props.mapData;
      const coordinates = { longitude: longitude, latitude: latitude };
      const encodedCoords = encodeURI(JSON.stringify(coordinates));

      const route = `http://localhost:5000/api/geojson/parcels/address/${encodedCoords}/${year}`;
      this.props
        .dispatch(handleGetParcelsByQueryAction(route))
        .then(geojson => {
          this._createNewViewport(geojson);
        });

      //build the address string
      const addressString = createAddressString(
        propno,
        propdir,
        propstr,
        propzip
      );
      const state = null;
      const title = "";
      const newUrl = `/address?search=${encodeURI(
        addressString
      )}&coordinates=${encodedCoords}`;
      //change the url
      window.history.pushState(state, title, newUrl);

      //get viewer image
      this.props.dispatch(handleGetViewerImageAction(longitude, latitude));
      //handle all the download data and setting search
      this.props.dispatch(dataIsLoadingAction(true));
      const downloadDataRoute = `/api/address-search/download/${encodedCoords}/${year}`;
      this.props.dispatch(handleGetDownloadDataAction(downloadDataRoute));

      // change the partial results
      this.props
        .dispatch(handleSearchPartialAddress(addressString, year))
        .then(json => {
          // set the search term to the first result of geocoder
          debugger;
          // if (json[0].mb.length > 0) {
          const proxySearchTerm = json[0].mb[0].place_name;
          this.props.dispatch(
            resetSearch({
              searchTerm: proxySearchTerm
            })
          );
          // }
        });
      this.props.dispatch(dataIsLoadingAction(false));
      //set the display type to address
      this.props.dispatch(setSearchType("Address"));
      this.props.dispatch(setSearchDisplayType("single-address"));
      this.props.dispatch(toggleFullResultsAction(true));
      this.props.dispatch(togglePartialResultsAction(false));
    }
  }
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
          maxZoom={18}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onViewportChange={this._onViewportChange}
          onHover={this._onHover}
          interactiveLayerIds={["parcel-polygon"]}
          onClick={e => {
            this._handleMapClick(e);
          }}
          // getCursor={this._getCursor}
        >
          {/* <Marker
            latitude={42.35554476757099}
            longitude={-82.9895677109488}
            // offsetLeft={-20}
            // offsetTop={-10}
          >
            <ArrowIcon style={{ transform: "rotate(350deg)" }} />
          </Marker> */}

          {latitude && longitude ? (
            <PraxisMarker
              {...this.props}
              createNewViewport={this._createNewViewport}
            />
          ) : null}
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
