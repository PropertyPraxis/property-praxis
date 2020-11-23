const primarySearch = require("./primarySearch");
const detailedSearch = require("./detailedSearch");
const geoJSONSearch = require("./geojsonSearch");
const reverseGeocode = require("./reverseGeocode");
const generalDBSearch = require("./generalDBSearch");

// depending on how nginx is set up in production,
// the "/api will need to be removed"
if (process.env.NODE_ENV === "development") {
  module.exports = (app) => {
    app.use("/api/primary-search", primarySearch);
    app.use("/api/detailed-search", detailedSearch);
    app.use("/api/geojson", geoJSONSearch);
    app.use("/api/reverse-geocode", reverseGeocode);
    app.use("/api/general", generalDBSearch);
  };
}

if (process.env.NODE_ENV === "production") {
  module.exports = (app) => {
    app.use("/primary-search", primarySearch);
    app.use("/detailed-search", detailedSearch);
    app.use("/geojson", geoJSONSearch);
    app.use("/reverse-geocode", reverseGeocode);
    app.use("/api/general", generalDBSearch);
  };
}
