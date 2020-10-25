import React, { Component, useRef } from "react";
import PropTypes from "prop-types";
import ReactMapGL, { Source, Layer, Marker } from "react-map-gl";
import ParcelLayerController from "./ParcelLayerController";
import BasemapController from "./BasemapController";
import { createNewViewport } from "../../utils/map";
import { createAddressString, createLayerFilter } from "../../utils/helper";
import {
  getMapStateAction,
  toggleLoadingIndicatorAction,
} from "../../actions/mapState";
import { getHoveredFeatureAction } from "../../actions/currentFeature";
import {
  logMarkerDragEventAction,
  onMarkerDragEndAction,
  setMarkerCoordsAction,
  handleGetZipcodesDataAction,
  handleGetParcelsByQueryAction,
  handleGetReverseGeocodeAction,
} from "../../actions/mapData";
import {
  parcelLayer,
  parcelHighlightLayer,
  parcelCentroid,
  zipsLayer,
  zipsLabel,
} from "./mapStyle";
import Pin from "./Pin";
import * as styleVars from "../../scss/colors.scss";

/*This API token works for propertypraxis.org  */
const MAPBOX_TOKEN =
  "pk.eyJ1IjoibWFwcGluZ2FjdGlvbiIsImEiOiJjazZrMTQ4bW4wMXpxM251cnllYnR6NjMzIn0.9KhQIoSfLvYrGCl3Hf_9Bw";
// "pk.eyJ1IjoidGltLWhpdGNoaW5zIiwiYSI6ImNqdmNzODZ0dDBkdXIzeW9kbWRtczV3dDUifQ.29F1kg9koRwGRwjg-vpD6A";

class PraxisMarker extends React.Component {
  _logDragEvent(name, event) {
    this.props.dispatch(logMarkerDragEventAction(name, event));
  }

  _onMarkerDragStart = (event) => {
    this._logDragEvent("onDragStart", event);
  };

  _onMarkerDrag = (event) => {
    this._logDragEvent("onDrag", event);
  };

  _onMarkerDragEnd = async (event) => {
    this._logDragEvent("onDragEnd", event);
    this.props.dispatch(onMarkerDragEndAction(event));

    // get the marker coords
    const [markerLongitude, markerLatitude] = event.lngLat;
    const encodedCoords = encodeURI(
      JSON.stringify({
        longitude: markerLongitude,
        latitude: markerLatitude,
      })
    );

    // query mapbox api based on those coords
    const apiReverseGeocodeRoute = `/api/address-search/reverse-geocode/${encodedCoords}`;
    const { place_name, geometry } = await this.props.dispatch(
      handleGetReverseGeocodeAction(apiReverseGeocodeRoute)
    );
    const [reverseGCLongitude, reverseGCLatitude] = geometry.coordinates;
    const { searchYear } = this.props.searchState;
    const reverseGCEncodedCoords = encodeURI(
      JSON.stringify({
        longitude: reverseGCLongitude,
        latitude: reverseGCLatitude,
      })
    );

    // create a new route using the api return data
    const clientRoute = `/map?type=address&search=${place_name}&coordinates=${reverseGCEncodedCoords}&year=${searchYear}`;
    this.props.history.push(clientRoute);
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
        <Pin size={30} />
      </Marker>
    );
  }
}

PraxisMarker.propTypes = {
  mapData: PropTypes.shape({
    marker: PropTypes.shape(
      {
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
      }.isRequired
    ),
  }).isRequired,
  createNewViewport: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

class PraxisMap extends Component {
  _stops = [
    [1, styleVars.parcelStop1],
    [2, styleVars.parcelStop2],
    [3, styleVars.parcelStop3],
    [4, styleVars.parcelStop4],
    [5, styleVars.parcelStop5],
    [6, styleVars.parcelStop6],
    [7, styleVars.parcelStop7],
  ];

  // returns a route dependent on URL search params passed from MapContainer
  _routeSwitcher = ({
    searchType,
    searchTerm,
    searchCoordinates,
    searchYear,
  }) => {
    switch (searchType) {
      case "zipcode":
        return `/api/geojson/parcels/${searchType}/${searchTerm}/${searchYear}`;
      case "speculator":
        return `/api/geojson/parcels/${searchType}/${searchTerm}/${searchYear}`;
      case "address":
        return `/api/geojson/parcels/address/${searchCoordinates}/${searchYear}`;
      default:
        return `/api/geojson/parcels/${searchYear}`;
    }
  };

  // create new vieport dependent on geojson bbox
  _createNewViewport = (geojson) => {
    const { searchYear } = this.props.searchState;
    const features = geojson.features;
    const { viewport } = this.props.mapState;
    const { longitude, latitude, zoom } = createNewViewport(geojson, viewport);
    const newViewport = {
      ...viewport,
      longitude,
      latitude,
      zoom,
      transitionDuration: 1000,
    };

    // if the return geojson has features aka the search term was
    // valid then change the veiwport accordingly
    features
      ? this.props.dispatch(getMapStateAction(newViewport))
      : this.props.dispatch(
          handleGetParcelsByQueryAction(`/api/geojson/parcels/${searchYear}`) //default return
        );
  };

  _getMapData = async () => {
    // Toggle loading on (will be togled off on map load)
    this.props.dispatch(toggleLoadingIndicatorAction(true));

    // Build route and get data
    const route = this._routeSwitcher(this.props.searchQueryParams);

    // Get Data
    const parcelsGeojson = await this.props.dispatch(
      handleGetParcelsByQueryAction(route)
    );

    const zipsGeojson = await this.props.dispatch(
      handleGetZipcodesDataAction("/api/geojson/zipcodes")
    );
    // toggle indicator (need refactor to hook in)
    if (parcelsGeojson && zipsGeojson) {
      this.props.dispatch(toggleLoadingIndicatorAction(false));
    }

    //Set viewport
    this._createNewViewport(parcelsGeojson);

    // set marker not undefined or null
    const { searchCoordinates } = this.props.searchQueryParams;
    if (searchCoordinates) {
      const { longitude, latitude } = JSON.parse(decodeURI(searchCoordinates));
      this.props.dispatch(setMarkerCoordsAction(longitude, latitude));
    } else {
      this.props.dispatch(setMarkerCoordsAction(null, null));
    }
  };

  _onViewportChange = (viewport) => {
    this.props.dispatch(getMapStateAction({ ...viewport }));
  };

  _onHover = (event) => {
    const {
      features,
      srcEvent: { offsetX, offsetY },
    } = event;

    const hoveredFeature =
      features && features.find((f) => f.layer.id === "parcel-polygon");

    this.props.dispatch(
      getHoveredFeatureAction({ hoveredFeature, x: offsetX, y: offsetY })
    );
  };

  _renderTooltip() {
    const { hoveredFeature, x, y } = this.props.currentFeature;

    return (
      hoveredFeature && (
        <div className="tooltip" style={{ left: x, top: y }}>
          <div>Speculator: {hoveredFeature.properties.own_id}</div>
          <div>Properties owned: {hoveredFeature.properties.count}</div>
          <div>{hoveredFeature.properties.propaddr}</div>
        </div>
      )
    );
  }

  // add a new marker if user clicks on a parcel feature
  // nothing happens if there is no feature
  _handleMapClick = async (event) => {
    const { hoveredFeature } = this.props.currentFeature;
    if (hoveredFeature) {
      const [markerLongitude, markerLatitude] = event.lngLat;

      // set the marker based on event feature coords
      this.props.dispatch(
        setMarkerCoordsAction(markerLongitude, markerLatitude)
      );
      const { searchYear } = this.props.searchState;
      const coordinates = {
        longitude: markerLongitude,
        latitude: markerLatitude,
      };

      // build route using feature properties
      const { propno, propstr, propdir, propzip } = hoveredFeature.properties;
      const encodedCoords = encodeURI(JSON.stringify(coordinates));
      const addressString = createAddressString({
        propno,
        propdir,
        propstr,
        propzip,
      });

      const clientRoute = `/map?type=address&search=${addressString}&coordinates=${encodedCoords}&year=${searchYear}`;
      this.props.history.push(clientRoute);
    }
  };

  _handleToggleLoadingIndicator = (isLoading) => {
    this.props.dispatch(toggleLoadingIndicatorAction(isLoading));
  };

  componentDidMount() {
    this._getMapData();
  }

  componentDidUpdate(prevProps) {
    // if the location changes, query for new data
    if (this.props.location.search !== prevProps.location.search) {
      this._getMapData();
    }
  }

  render() {
    //create the new viewport before rendering
    const { latitude, longitude } = this.props.mapData.marker;
    const { hoveredFeature } = this.props.currentFeature;
    const highlightFilter = hoveredFeature
      ? hoveredFeature.properties.feature_id
      : "";
    const { ppraxis, zips } = this.props.mapData;
    const { basemapLayer } = this.props.controller;
    const { sliderValue, filter } = this.props.controller;
    const parcelLayerFilter = createLayerFilter(filter);

    return (
      <div className="map">
        <ReactMapGL
          {...this.props.mapState.viewport}
          mapOptions={{ attributionControl: false }}
          mapStyle={basemapLayer}
          width="100vw"
          height="100vh"
          minZoom={10}
          maxZoom={18}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onViewportChange={this._onViewportChange}
          interactiveLayerIds={["parcel-polygon"]}
          onHover={this._onHover}
          onClick={(e) => {
            this._handleMapClick(e);
          }}
          onLoad={() => {
            this._handleToggleLoadingIndicator(false);
          }}
        >
          {latitude && longitude ? (
            <PraxisMarker
              {...this.props}
              createNewViewport={this._createNewViewport}
            />
          ) : null}

          <Source id="parcels" type="geojson" data={ppraxis}>
            <Layer
              key="parcel-centroid"
              {...parcelCentroid}
              filter={parcelLayerFilter}
              paint={{
                "circle-radius": 3,
                "circle-color": {
                  property: "own_group",
                  stops: this._stops,
                },
                "circle-opacity": sliderValue / 100,
              }}
            />

            <Layer
              key="parcel-layer"
              {...parcelLayer}
              paint={{
                "fill-color": {
                  property: "own_group",
                  stops: this._stops,
                },
                "fill-opacity": sliderValue / 100,
                "fill-outline-color": "rgba(255,255,255,1)",
              }}
              filter={parcelLayerFilter}
            />
            <Layer
              key="highlight-parcel-layer"
              {...parcelHighlightLayer}
              filter={["in", "feature_id", highlightFilter]}
            />
          </Source>

          {this._renderTooltip()}
          <Source id="zips" type="geojson" data={zips}>
            <Layer key="zips-layer" {...zipsLayer} />
            <Layer key="zips-label" {...zipsLabel} />
          </Source>
        </ReactMapGL>
        <ParcelLayerController {...this.props} />
        <BasemapController {...this.props} />
      </div>
    );
  }
}

PraxisMap.propTypes = {
  mapData: PropTypes.shape({
    marker: PropTypes.shape(
      {
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
      }.isRequired
    ),
    ppraxis: PropTypes.object.isRequired,
    zips: PropTypes.object.isRequired,
  }).isRequired,
  currentFeature: PropTypes.shape({
    hoveredFeature: PropTypes.oneOfType([
      PropTypes.object.isRequired,
      PropTypes.oneOf([undefined]),
    ]),
  }).isRequired,
  controller: PropTypes.shape({
    filter: PropTypes.array.isRequired,
    sliderValue: PropTypes.number.isRequired,
    basemapLayer: PropTypes.string.isRequired,
  }).isRequired,
  mapState: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default PraxisMap;
/* <Marker
  latitude={42.35554476757099}
  longitude={-82.9895677109488}
  // offsetLeft={-20}
  // offsetTop={-10}
>
  <ArrowIcon style={{ transform: "rotate(350deg)" }} />
</Marker>; */
