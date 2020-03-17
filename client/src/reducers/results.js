import { TOGGLE_RESULTS } from "../actions/results";

export default function toggleResults(state = true, action) {
  switch (action.type) {
    case TOGGLE_RESULTS:
      return action.payload;
    default:
      return state;
  }
}
