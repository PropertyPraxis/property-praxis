const searchAddresses = require("./searchAddress");
const searchZipcodes = require("./searchZipcodes");
const searchSpeculators = require("./searchSpeculator");
const initialData = require("./initialData");
const searchParcels = require("./searchParcels");
const searchPraxisYears = require("./searchPraxisYears");
///////////////////////////////////////
const primarySearch = require("./primarySearch");
const geoJSONSearch = require("./geojsonSearch");
// depending on how nginx is set up in production,
// the "/api will need to be removed"
if (process.env.NODE_ENV === "development") {
  module.exports = (app) => {
    app.use("/api/address-search", searchAddresses);
    app.use("/api/zipcode-search", searchZipcodes);
    app.use("/api/speculator-search", searchSpeculators);
    app.use("/api/geojson", initialData);
    app.use("/api/geojson/parcels", searchParcels);
    app.use("/api/praxisyears", searchPraxisYears);
    //////////
    app.use("/api/primary-search", primarySearch);
    app.use("/api/geojson-test", geoJSONSearch);
  };
}

if (process.env.NODE_ENV === "production") {
  module.exports = (app) => {
    app.use("/address-search", searchAddresses);
    app.use("/zipcode-search", searchZipcodes);
    app.use("/speculator-search", searchSpeculators);
    app.use("/geojson", initialData);
    app.use("/geojson/parcels", searchParcels);
    app.use("/praxisyears", searchPraxisYears);
  };
}
