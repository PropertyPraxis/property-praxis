import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
import reducer from "./reducers";
import middleware from "./middleware";
import 'mapbox-gl/dist/mapbox-gl.css'; //mapbox css
import 'mapillary-js/dist/mapillary.min.css'; //mapillary css
import "./scss/index.scss";
import App from "./components/App";
import * as serviceWorker from "./serviceWorker";

//redux store
const store = createStore(reducer, middleware);

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
