const Router = require("express-promise-router");
const db = require("../db"); //index.js
const queries = require("../utils/queries");
const findTargetAddress = require("../utils/helper").findTargetAddress;
const buildGeoJSONTemplate = require("../utils/helper").buildGeoJSONTemplate;
const router = new Router();

router.get("/", async (req, res) => {
  try {
    const {
      type,
      ownid = null,
      code = null,
      place = null,
      coordinates = null,
      year = "2020",
    } = req.query;

    let pgData, clientData;
    switch (type) {
      case "parcels-by-geocode":
        // return geoJSON dependent on coverage
        let geoJSON;

        pgData = await queries.queryPGDB({
          place,
          coordinates,
          year,
          PGDBQueryType: queries.GEOJSON_PARCELS_DISTANCE,
        });

        // check to see if there is a distance of 0
        // which represents a target match
        const { features } = pgData.data[0].jsonb_build_object;

        // returns arrays
        const { targetAddress, nearbyAddresses } = findTargetAddress(features);

        if (targetAddress.length === 0 && nearbyAddresses.length === 0) {
          // this is a default empty geojson
          // where there is no features returned
          geoJSON = buildGeoJSONTemplate([]);
        } else if (targetAddress.length > 0) {
          geoJSON = buildGeoJSONTemplate(targetAddress);
        } else if (targetAddress.length === 0 && nearbyAddresses.length > 0) {
          geoJSON = buildGeoJSONTemplate(nearbyAddresses);
        } else {
          geoJSON = buildGeoJSONTemplate([]);
        }
        clientData = geoJSON;
        break;
      case "parcels-by-code":
        const { data } = await queries.queryPGDB({
          code,
          year,
          PGDBQueryType: queries.GEOJSON_PARCELS_CODE,
        });

        clientData = data[0].jsonb_build_object; //geoJSON
        break;

      case "parcels-by-speculator":
        pgData = await queries.queryPGDB({
          ownid,
          year,
          PGDBQueryType: queries.GEOJSON_PARCELS_OWNID,
        });
        clientData = pgData.data[0].jsonb_build_object; //geoJSON
        break;
      case "zipcode-all": // this shoudl be reowrked to hanlde "codes"
        pgData = await queries.queryPGDB({
          PGDBQueryType: queries.GEOJSON_ZIPCODES,
        });
        clientData = pgData.data[0].jsonb_build_object;
        break;
      default:
        clientData = null;
        break;
    }

    res.json(clientData);
  } catch (err) {
    const msg = `An error occurred executing parcels geoJSON query. Message: ${err}`;
    console.error(msg);
    res.status(404).send(msg);
  }
});

module.exports = router;
