export const GET_MAP_STATE = "GET_MAP_STATE"
export const TOGGLE_LOADING_INDICATOR = "TOGGLE_LOADING_INDICATOR"

export function getMapStateAction(viewport) {
  return {
    type: GET_MAP_STATE,
    payload: { viewport },
  }
}

export function toggleLoadingIndicatorAction(loadingIsOpen) {
  return {
    type: TOGGLE_LOADING_INDICATOR,
    payload: { loadingIsOpen },
  }
}
