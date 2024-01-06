import mapData from "./mapData"
import mapState from "./mapState"
import searchState from "./search"
import currentFeature from "./currentFeature"
import controller from "./controller"
import redirect from "./redirect"
import middleware from "../middleware"
import { combineReducers, createStore } from "redux"

const rootReducer = combineReducers({
  mapData,
  mapState,
  searchState,
  currentFeature,
  controller,
  redirect,
})

const store = createStore(rootReducer, middleware)

export default store
