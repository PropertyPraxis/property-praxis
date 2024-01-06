export const SET_SLIDER_VALUE = "SET_SLIDER_VALUE"
export const SET_PARCEL_FILTER = "SET_PARCEL_FILTER"
export const TOGGLE_BASEMAP = "TOGGLE_BASEMAP"

export function setSliderValueAction(sliderValue) {
  return {
    type: SET_SLIDER_VALUE,
    payload: { sliderValue },
  }
}

export function setParcelFilterAction(val) {
  return {
    type: SET_PARCEL_FILTER,
    payload: { filter: [val] },
  }
}

export function toggleBasemapAction(basemapLayer) {
  return {
    type: TOGGLE_BASEMAP,
    payload: { basemapLayer },
  }
}
