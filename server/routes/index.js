const primarySearch = require("./primarySearch")
const detailedSearch = require("./detailedSearch")
const geoJSONSearch = require("./geojsonSearch")
const reverseGeocode = require("./reverseGeocode")
const generalDBSearch = require("./generalDBSearch")
const health = require("./health")

module.exports = (app) => {
  app.use("/api/primary-search", primarySearch)
  app.use("/api/detailed-search", detailedSearch)
  app.use("/api/geojson", geoJSONSearch)
  app.use("/api/reverse-geocode", reverseGeocode)
  app.use("/api/general", generalDBSearch)
  app.use("/api/health", health)
}
