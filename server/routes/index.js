const searchAddresses = require("./searchAddress");
const searchZipcodes = require("./searchZipcodes");
const searchSpeculators = require("./searchSpeculator");
const initialData = require("./initialData");
const searchParcels = require("./searchParcels");

module.exports = app => {
  app.use("/api/address-search", searchAddresses);
  app.use("/api/zipcode-search", searchZipcodes);
  app.use("/api/speculator-search", searchSpeculators);
  app.use("/api/geojson", initialData);
  app.use("/api/geojson/parcels", searchParcels);
};
