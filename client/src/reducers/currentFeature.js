import {
  GET_HOVERED_FEATURE,
  SET_HIGHLIGHT_FEATURE,
} from "../actions/currentFeature"

const initialState = {
  hoveredFeature: null,
  highlightIds: [""],
}

export default function currentFeature(state = initialState, action) {
  switch (action.type) {
    case GET_HOVERED_FEATURE:
      return { ...state, ...action.payload }
    case SET_HIGHLIGHT_FEATURE:
      return { ...state, ...action.payload }
    default:
      return state
  }
}
