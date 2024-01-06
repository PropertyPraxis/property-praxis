export const GET_HOVERED_FEATURE = "GET_HOVERED_FEATURE"
export const SET_HIGHLIGHT_FEATURE = "SET_HIGHLIGHT_FEATURE"

export function getHoveredFeatureAction(feature) {
  return {
    type: GET_HOVERED_FEATURE,
    payload: feature,
  }
}

export function setHighlightFeaturesAction(highlightIds) {
  return {
    type: SET_HIGHLIGHT_FEATURE,
    payload: { highlightIds },
  }
}
