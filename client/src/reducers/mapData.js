import { GET_INITIAL_MAP_DATA } from "../actions/mapData";

export default function mapData(state = {}, action) {
  switch (action.type) {
    case GET_INITIAL_MAP_DATA:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
