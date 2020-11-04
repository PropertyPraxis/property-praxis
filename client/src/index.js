import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
import reducer from "./reducers";
import middleware from "./middleware";
import App from "./components/App";
import "mapbox-gl/dist/mapbox-gl.css"; //mapbox css
import "mapillary-js/dist/mapillary.min.css"; //mapillary css
import "./scss/index.scss";

//redux store
const store = createStore(reducer, middleware);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
