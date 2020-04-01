import {
  getInitialMapData,
  getInitialZipcodeData,
  getMapData
} from "../utils/api";

export const GET_INITIAL_MAP_DATA = "GET_INITIAL_MAP_DATA";
export const GET_INITIAL_ZIPCODE_DATA = "GET_INITIAL_ZIPCODE_DATA";
export const GET_PARCELS_BY_QUERY = "GET_PARCELS_BY_QUERY";
export const GET_YEAR = "GET_YEAR";
export const LOG_MARKER_DRAG = "LOG_MARKER_DRAG";
export const MARKER_DRAG_END = "MARKER_DRAG_END";
export const SET_MARKER_COORDS = "SET_MARKER_COORDS";
export const DATA_IS_LOADING = "DATA_IS_LOADING";

function getInitialMapDataAction(data) {
  return {
    type: GET_INITIAL_MAP_DATA,
    payload: { ppraxis: data }
  };
}

function getInitialZipcodeDataAction(data) {
  return {
    type: GET_INITIAL_ZIPCODE_DATA,
    payload: { zips: data }
  };
}

export function getYearAction(year) {
  return {
    type: GET_YEAR,
    payload: { year }
  };
}

export function getParcelsByQueryAction(data) {
  return {
    type: GET_PARCELS_BY_QUERY,
    payload: { ppraxis: data }
  };
}

export function logMarkerDragEventAction(name, event) {
  return {
    type: LOG_MARKER_DRAG,
    payload: {
      events: { [name]: event.lngLat }
    }
  };
}

export function onMarkerDragEndAction(event) {
  return {
    type: MARKER_DRAG_END,
    payload: {
      marker: {
        longitude: event.lngLat[0],
        latitude: event.lngLat[1]
      }
    }
  };
}

export function setMarkerCoordsAction(latitude, longitude) {
  return {
    type: MARKER_DRAG_END,
    payload: {
      marker: {
        longitude,
        latitude
      }
    }
  };
}

export function dataIsLoadingAction(dataIsLoading) {
  return {
    type: DATA_IS_LOADING,
    payload: { dataIsLoading }
  };
}

export function handleGetInitialMapDataAction(route) {
  return dispatch => {
    return getInitialMapData(route)
      .then(json => {
        dispatch(getInitialMapDataAction({}));
        dispatch(getInitialMapDataAction(json));
        return json;
      })
      .catch(err => {
        throw Error(`An error occured searching: ${err}`);
      });
  };
}

export function handleGetInitialZipcodeDataAction(route) {
  return dispatch => {
    return getInitialZipcodeData(route)
      .then(json => {
        dispatch(getInitialZipcodeDataAction({}));
        dispatch(getInitialZipcodeDataAction(json));
        return json;
      })
      .catch(err => {
        throw Error(`An error occured searching: ${err}`);
      });
  };
}

export function handleGetParcelsByQueryAction(route) {
  return dispatch => {
    return getMapData(route)
      .then(json => {
        dispatch(getParcelsByQueryAction(json));
        return json;
      })
      .catch(err => {
        throw Error(`An error occured searching: ${err}`);
      });
  };
}

// export const GET_PARCELS_BY_ZIPCODE = "GET_PARCELS_BY_ZIPCODE";
// export const GET_PARCELS_BY_SPECULATOR = "GET_PARCELS_BY_SPECULATOR";

// getParcelsByZipcode,
// getParcelsBySpeculator,
// this action is the same as getInitialMapDataAction
// export function getParcelsByZipcodeAction(data) {
//   return {
//     type: GET_PARCELS_BY_ZIPCODE,
//     payload: { ppraxis: data }
//   };
// }

// export function getParcelsBySpeculatorAction(data) {
//   return {
//     type: GET_PARCELS_BY_SPECULATOR,
//     payload: { ppraxis: data }
//   };
// }

// export function handleGetParcelsByZipcodeAction(route) {
//   return dispatch => {
//     return getMapData(route)
//       .then(json => {
//         // dispatch(getParcelsByZipcodeAction({}));
//         dispatch(getParcelsByZipcodeAction(json));
//         return json;
//       })
//       .catch(err => {
//         throw Error(`An error occured searching: ${err}`);
//       });
//   };
// }

// export function handleGetParcelsBySpeculatorAction(route) {
//   return dispatch => {
//     return getMapData(route).then(json => {
//       // dispatch(getParcelsByZipcodeAction({}));
//       dispatch(getParcelsBySpeculatorAction(json));
//       return json;
//     });
//   };
// }
