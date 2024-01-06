import { APISearchQueryFromRoute } from "../utils/api"

export const GET_PARCELS_BY_QUERY = "GET_PARCELS_BY_QUERY"
export const GET_YEAR = "GET_YEAR"
export const GET_ZIPCODES = "GET_ZIPCODES"
export const GET_REVERSE_GEOCODE = "GET_REVERSE_GEOCODE"
export const LOG_MARKER_DRAG = "LOG_MARKER_DRAG"
export const MARKER_DRAG_END = "MARKER_DRAG_END"
export const SET_MARKER_COORDS = "SET_MARKER_COORDS"

export function getYearAction(year) {
  return {
    type: GET_YEAR,
    payload: { year },
  }
}

function getZipcodesDataAction(zips) {
  return {
    type: GET_ZIPCODES,
    payload: { zips },
  }
}

export function getParcelsByQueryAction(ppraxis) {
  return {
    type: GET_PARCELS_BY_QUERY,
    payload: { ppraxis },
  }
}

function getReverseGeocodeAction(reverseGeocode) {
  return {
    type: GET_REVERSE_GEOCODE,
    payload: { reverseGeocode },
  }
}

export function logMarkerDragEventAction(name, event) {
  return {
    type: LOG_MARKER_DRAG,
    payload: {
      events: { [name]: event.lngLat },
    },
  }
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
  }
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
  }
}

export function handleGetParcelsByQueryAction(route) {
  return (dispatch) => {
    dispatch(getParcelsByQueryAction(null))
    return APISearchQueryFromRoute(route)
      .then((data) => {
        dispatch(getParcelsByQueryAction(data))
        return data
      })
      .catch((err) => {
        throw Error(`An error occured searching parcels: ${err}`)
      })
  }
}

export function handleGetReverseGeocodeAction(route) {
  return (dispatch) => {
    return APISearchQueryFromRoute(route)
      .then((json) => {
        dispatch(getReverseGeocodeAction(json))
        return json
      })
      .catch((err) => {
        throw Error(`An error occured reverse geocoding: ${err}`)
      })
  }
}

export function handleGetZipcodesDataAction(route) {
  return (dispatch) => {
    dispatch(getZipcodesDataAction(null))
    return APISearchQueryFromRoute(route)
      .then((json) => {
        dispatch(getZipcodesDataAction(json))
        return json
      })
      .catch((err) => {
        throw Error(`An error occured fetching zipcodes: ${err}`)
      })
  }
}
