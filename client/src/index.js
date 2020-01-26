import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
import L from "leaflet"; //regular leaflet
import reducer from "./reducers";
import middleware from "./middleware";
import "leaflet/dist/leaflet.css"; //regular leaflet css
import 'mapbox-gl/dist/mapbox-gl.css'; //mapbox css
import "./scss/index.scss";
import App from "./components/App";
import * as serviceWorker from "./serviceWorker";

//redux store
const store = createStore(reducer, middleware);

//annoying hack to deal with webpack and marker icon
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
