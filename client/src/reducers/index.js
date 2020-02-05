import mapData from "./mapData";
import mapState from "./mapState";
import searchState from "./search";
import currentFeature from "./currentFeature";
import { combineReducers } from "redux";

export default combineReducers({
  mapData,
  mapState,
  searchState,
  currentFeature
});
