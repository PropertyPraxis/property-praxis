import mapData from "./mapData";
import mapState from "./mapState";
import searchState from "./search";
import currentFeature from "./currentFeature";
import toggleModal from "./modal";
import results from "./results";
import controller from "./controller";
import { combineReducers } from "redux";

export default combineReducers({
  mapData,
  mapState,
  searchState,
  currentFeature,
  modalIsOpen: toggleModal,
  results,
  controller
});
