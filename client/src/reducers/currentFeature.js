import { GET_HOVERED_FEATURE } from "../actions/currentFeature";

export default function currentFeature(state = {}, action) {
  switch (action.type) {
    case GET_HOVERED_FEATURE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
