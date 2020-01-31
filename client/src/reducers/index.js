import mapData from "./mapData";
import mapState from "./mapState";
import currentFeature from "./currentFeature";
import { combineReducers } from "redux";

export default combineReducers({
  mapData,
  currentFeature,
  mapState
});
