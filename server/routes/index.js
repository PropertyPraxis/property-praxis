const praxisYearsSearch = require("./praxisYearsSearch");
const primarySearch = require("./primarySearch");
const geoJSONSearch = require("./geojsonSearch");
const reverseGeocode = require("./reverseGeocode");
// depending on how nginx is set up in production,
// the "/api will need to be removed"
if (process.env.NODE_ENV === "development") {
  module.exports = (app) => {
    app.use("/api/primary-search", primarySearch);
    app.use("/api/geojson-test", geoJSONSearch);
    app.use("/api/reverse-geocode", reverseGeocode);
    app.use("/api/praxisyears", praxisYearsSearch);
  };
}

if (process.env.NODE_ENV === "production") {
  module.exports = (app) => {
    app.use("/primary-search", primarySearch);
    app.use("/geojson-test", geoJSONSearch);
    app.use("/reverse-geocode", reverseGeocode);
    app.use("/praxisyears", praxisYearsSearch);
  };
}
