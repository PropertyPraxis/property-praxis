//uncomment logger for development
import logger from "./logger"
import { thunk } from "redux-thunk"
import { applyMiddleware, compose } from "redux"

//boiler plate to use redux devtools
// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const composeEnhancers = compose

export default composeEnhancers(applyMiddleware(thunk, logger))
