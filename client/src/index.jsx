import React from "react"
import ReactDOM from "react-dom"
import store from "./reducers"
import { Provider } from "react-redux"
import * as Sentry from "@sentry/react"
import App from "./components/App"
import "mapbox-gl/dist/mapbox-gl.css" //mapbox css
import "mapillary-js/dist/mapillary.css" //mapillary css
import "./scss/index.scss"

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "https://66094b96912bcb73c3fcfa41b394e9bb@o86794.ingest.sentry.io/4506565004754944",
    // TODO: Make this smarter
    environment: window.location.host === "propertypraxis.org" ? "prod" : "dev",
  })
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
)
