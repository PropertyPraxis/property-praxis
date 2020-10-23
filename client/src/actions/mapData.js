import {
  getInitialMapData,
  getInitialZipcodeData,
  getMapData,
  getPraxisZipcodes,
} from "../utils/api";

export const GET_INITIAL_MAP_DATA = "GET_INITIAL_MAP_DATA";
export const GET_INITIAL_ZIPCODE_DATA = "GET_INITIAL_ZIPCODE_DATA";
export const GET_PARCELS_BY_QUERY = "GET_PARCELS_BY_QUERY";
export const GET_YEAR = "GET_YEAR";
export const GET_ZIPCODES = "GET_ZIPCODES";
export const GET_REVERSE_GEOCODE = "GET_REVERSE_GEOCODE";
export const LOG_MARKER_DRAG = "LOG_MARKER_DRAG";
export const MARKER_DRAG_END = "MARKER_DRAG_END";
export const SET_MARKER_COORDS = "SET_MARKER_COORDS";

function getInitialMapDataAction(ppraxis) {
  return {
    type: GET_INITIAL_MAP_DATA,
    payload: { ppraxis },
  };
}

function getInitialZipcodeDataAction(zips) {
  return {
    type: GET_INITIAL_ZIPCODE_DATA,
    payload: { zips },
  };
}

export function getYearAction(year) {
  return {
    type: GET_YEAR,
    payload: { year },
  };
}

function getZipcodesAction(zipcodes) {
  return {
    type: GET_ZIPCODES,
    payload: { zipcodes },
  };
}

export function getParcelsByQueryAction(ppraxis) {
  return {
    type: GET_PARCELS_BY_QUERY,
    payload: { ppraxis },
  };
}

function getReverseGeocodeAction(reverseGeocode) {
  return {
    type: GET_REVERSE_GEOCODE,
    payload: { reverseGeocode },
  };
}

export function logMarkerDragEventAction(name, event) {
  return {
    type: LOG_MARKER_DRAG,
    payload: {
      events: { [name]: event.lngLat },
    },
  };
}

export function onMarkerDragEndAction(event) {
  return {
    type: MARKER_DRAG_END,
    payload: {
      marker: {
        longitude: event.lngLat[0],
        latitude: event.lngLat[1],
      },
    },
  };
}

export function setMarkerCoordsAction(longitude, latitude) {
  return {
    type: MARKER_DRAG_END,
    payload: {
      marker: {
        longitude,
        latitude,
      },
    },
  };
}

export function handleGetInitialMapDataAction(route) {
  return (dispatch) => {
    return getInitialMapData(route)
      .then((json) => {
        dispatch(getInitialMapDataAction({}));
        dispatch(getInitialMapDataAction(json));
        return json;
      })
      .catch((err) => {
        throw Error(`An error occured searching: ${err}`);
      });
  };
}

export function handleGetInitialZipcodeDataAction(route) {
  return (dispatch) => {
    return getInitialZipcodeData(route)
      .then((json) => {
        dispatch(getInitialZipcodeDataAction({}));
        dispatch(getInitialZipcodeDataAction(json));
        return json;
      })
      .catch((err) => {
        throw Error(`An error occured searching: ${err}`);
      });
  };
}

export function handleGetParcelsByQueryAction(route) {
  return (dispatch) => {
    return getMapData(route)
      .then((json) => {
        dispatch(getParcelsByQueryAction(json));
        return json;
      })
      .catch((err) => {
        throw Error(`An error occured searching: ${err}`);
      });
  };
}

export function handleGetReverseGeocodeAction(route) {
  return (dispatch) => {
    return getMapData(route)
      .then((json) => {
        dispatch(getReverseGeocodeAction(json));
        return json;
      })
      .catch((err) => {
        throw Error(`An error occured searching: ${err}`);
      });
  };
}

export function handleGetZipcodesAction(route) {
  return (dispatch) => {
    return getPraxisZipcodes(route)
      .then((json) => {
        dispatch(getZipcodesAction(json));
        return json;
      })
      .catch((err) => {
        throw Error(`An error occured searching: ${err}`);
      });
  };
}
