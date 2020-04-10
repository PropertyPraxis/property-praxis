const searchAddresses = require("./searchAddress");
const searchZipcodes = require("./searchZipcodes");
const searchSpeculators = require("./searchSpeculator");
const initialData = require("./initialData");
const searchParcels = require("./searchParcels");
const searchPraxisYears = require("./searchPraxisYears");

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
  };
}

if (process.env.NODE_ENV === "production") {
  module.exports = (app) => {
    app.use("/api/address-search", searchAddresses);
    app.use("/api/zipcode-search", searchZipcodes);
    app.use("/api/speculator-search", searchSpeculators);
    app.use("/api/geojson", initialData);
    app.use("/api/geojson/parcels", searchParcels);
    app.use("/api/praxisyears", searchPraxisYears);
  };
}
