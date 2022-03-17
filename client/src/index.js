import React from "react";
import ReactDOM from "react-dom";
import store from "./reducers";
import { Provider } from "react-redux";
import App from "./components/App";
import "mapbox-gl/dist/mapbox-gl.css"; //mapbox css
import "mapillary-js/dist/mapillary.css"; //mapillary css
import "./scss/index.scss";

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
