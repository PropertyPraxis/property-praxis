const searchZipcodes = require("./searchZipcodes");
const initialData = require("./initialData");

module.exports = app => {
  app.use("/api/zipcode-search", searchZipcodes);
  app.use("/api/geojson", initialData);
};
