export const SET_SLIDER_VALUE = "SET_SLIDER_VALUE";
export const SET_PARCEL_FILTER = "SET_PARCEL_FILTER";

export function setSliderValueAction(sliderValue) {
  return {
    type: SET_SLIDER_VALUE,
    payload: { sliderValue }
  };
}

export function setParcelFilterAction(val) {
  return {
    type: SET_PARCEL_FILTER,
    payload: { filter: [val] }
  };
}

// export function handleSetParcelFilterAction(val) {}
