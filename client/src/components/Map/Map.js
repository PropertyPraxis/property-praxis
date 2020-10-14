import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactMapGL, { Source, Layer, Marker } from "react-map-gl";
import ParcelLayerController from "./ParcelLayerController";
import BasemapController from "./BasemapController";
import { createNewViewport } from "../../utils/map";
import { createAddressString, createLayerFilter } from "../../utils/helper";
import {
  handleGetInitialZipcodeDataAction,
  handleGetParcelsByQueryAction,
} from "../../actions/mapData";
import { getMapStateAction } from "../../actions/mapState";
import { getHoveredFeatureAction } from "../../actions/currentFeature";
import {
  handleSearchPartialAddress,
  resetSearch,
  setSearchDisplayType,
} from "../../actions/search";
import {
  logMarkerDragEventAction,
  onMarkerDragEndAction,
  setMarkerCoordsAction,
  dataIsLoadingAction,
} from "../../actions/mapData";
import {
  handleGetViewerImageAction,
  handleGetDownloadDataAction,
  toggleFullResultsAction,
  togglePartialResultsAction,
} from "../../actions/results";
import {
  parcelLayer,
  parcelHighlightLayer,
  parcelCentroid,
  zipsLayer,
  zipsLabel,
} from "./mapStyle";
import Pin from "./Pin";
import * as styleVars from "../../scss/colors.scss";

//this token needs to be hidden
// const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;
const MAPBOX_TOKEN =
  "pk.eyJ1IjoibWFwcGluZ2FjdGlvbiIsImEiOiJjazZrMTQ4bW4wMXpxM251cnllYnR6NjMzIn0.9KhQIoSfLvYrGCl3Hf_9Bw";
// "pk.eyJ1IjoidGltLWhpdGNoaW5zIiwiYSI6ImNqdmNzODZ0dDBkdXIzeW9kbWRtczV3dDUifQ.29F1kg9koRwGRwjg-vpD6A";
// GeoJSON Data source used in vector tiles, documented at
// https://gist.github.com/ryanbaumann/a7d970386ce59d11c16278b90dde094d

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

  _onMarkerDragEnd = (event) => {
    this._logDragEvent("onDragEnd", event);
    this.props.dispatch(onMarkerDragEndAction(event));
    //change the window url

    //then do stuff with the new coords
    const [longitude, latitude] = event.lngLat;
    const { year } = this.props.mapData;
    const encodedCoords = encodeURI(
      JSON.stringify({
        longitude: longitude,
        latitude: latitude,
      })
    );

    //trigger a null display to set to loading
    // this.props.dispatch(setSearchDisplayType(null));

    const route = `/api/geojson/parcels/address/${encodedCoords}/${year}`;

    //start the download action
    this.props.dispatch(dataIsLoadingAction(true));
    // const downloadDataRoute = `/api/address-search/download/${encodedCoords}/${year}`;
    // this.props.dispatch(handleGetDownloadDataAction(downloadDataRoute));

    // query the parcels
    this.props
      .dispatch(handleGetParcelsByQueryAction(route))
      .then((geojson) => {
        //from praxis map
        this.props.createNewViewport(geojson);

        // a single address with marker on it
        if (
          geojson.features &&
          geojson.features.length === 1 &&
          geojson.features[0].properties.distance === 0
        ) {
          const {
            propno,
            propstr,
            propdir,
            propzip,
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
          )}&coordinates=${encodedCoords}&year=${year}`;

          //change the url
          window.history.pushState(state, title, newUrl);

          // trigger the new search display
          this.props.dispatch(setSearchDisplayType("single-address"));

          // change the partial results
          this.props
            .dispatch(handleSearchPartialAddress(addressString, year))
            .then((json) => {
              // set the search term to the first result of geocoder
              const proxySearchTerm = json[0].mb[0].place_name;
              this.props.dispatch(
                resetSearch({
                  searchTerm: proxySearchTerm,
                  searchType: "Address",
                })
              );
            });
        }

        if (geojson.features && geojson.features.length > 1) {
          this.props.dispatch(
            resetSearch({
              searchTerm: "",
              searchType: "All",
              partialResults: [],
              searchDisplayType: "multiple-parcels",
            })
          );
        }

        //empty geojson
        if (geojson.features[0].properties.id === -1) {
          this.props.dispatch(
            resetSearch({
              searchTerm: "",
              searchType: "All",
              partialResults: [],
              searchDisplayType: "out-of-bounds",
            })
          );
        }
        //handle all the download data and setting search
        this.props.dispatch(toggleFullResultsAction(true));
        this.props.dispatch(togglePartialResultsAction(false));
        this.props.dispatch(dataIsLoadingAction(false));
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
    year: PropTypes.string.isRequired,
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

  _onViewportChange = (viewport) => {
    this.props.dispatch(getMapStateAction({ ...viewport }));
  };

  // create new vieport dependent on current geojson bbox
  _createNewViewport = (geojson) => {
    //check to see what data is loaded
    const { year } = this.props.mapData;
    const features = geojson.features;
    const { viewport } = this.props.mapState;
    //instantiate new viewport object
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

      const route = `/api/geojson/parcels/address/${encodedCoords}/${year}`;
      this.props
        .dispatch(handleGetParcelsByQueryAction(route))
        .then((geojson) => {
          this._createNewViewport(geojson);
          this.props.dispatch(setSearchDisplayType("single-address"));

          // change the partial results
          this.props
            .dispatch(handleSearchPartialAddress(addressString, year))
            .then((json) => {
              // set the search term to the first result of geocoder
              const proxySearchTerm = json[0].mb[0].place_name;
              this.props.dispatch(
                resetSearch({
                  searchTerm: proxySearchTerm,
                  searchType: "Address",
                })
              );
            });
          this.props.dispatch(dataIsLoadingAction(false));
          this.props.dispatch(toggleFullResultsAction(true));
          this.props.dispatch(togglePartialResultsAction(false));
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
      const newUrl = `/map/address?search=${encodeURI(
        addressString
      )}&coordinates=${encodedCoords}&year=${year}`;
      //change the url
      window.history.pushState(state, title, newUrl);
      //get viewer image
      this.props.dispatch(handleGetViewerImageAction(longitude, latitude));
      //handle all the download data and setting search
      this.props.dispatch(dataIsLoadingAction(true));
      // const downloadDataRoute = `/api/address-search/download/${encodedCoords}/${year}`;
      // this.props.dispatch(handleGetDownloadDataAction(downloadDataRoute));
    }
  }

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

  // returns a route dependent on URL search params
  _routeSwitcher = (params) => {
    const { type, search, coordinates, year } = params;
    switch (type) {
      case "zipcode":
        return `/api/geojson/parcels/${type}/${search}/${year}`;
      case "speculator":
        return `/api/geojson/parcels/${type}/${search}/${year}`;
      case "address":
        return `/api/geojson/parcels/address/${coordinates}/${year}`;
      default:
        return `/api/geojson/parcels/${year}`;
    }
  };

  _getMapData = async () => {
    const { mapParams } = this.props;
    const route = this._routeSwitcher(mapParams);

    // Get Data
    const parcelsGeojson = await this.props.dispatch(
      handleGetParcelsByQueryAction(route)
    );
    const zipsGeojson = await this.props.dispatch(
      handleGetInitialZipcodeDataAction("/api/geojson/zipcodes")
    );

    //Set viewport
    this._createNewViewport(parcelsGeojson);
  };

  async componentDidMount() {
    this._getMapData();
  }

  async componentDidUpdate(prevProps) {
    // if the location changes, query for new data
    if (this.props.mapParams.search !== prevProps.mapParams.search) {
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
          ref={(reactMap) => (this.reactMap = reactMap)}
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
            // add loading logic here
            console.log("map loaded");
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
    year: PropTypes.string.isRequired,
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
