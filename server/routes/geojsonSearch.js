const Router = require("express-promise-router");
const db = require("../db"); //index.js
const queries = require("../utils/queries");
const findTargetAddress = require("../utils/helper").findTargetAddress;
const buildGeoJSONTemplate = require("../utils/helper").buildGeoJSONTemplate;
const router = new Router();

router.get("/parcels", async (req, res) => {
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
      case "address":
        // return geoJSON dependent on coverage
        let geoJSON;

        pgData = await queries.queryPGDB({
          place,
          coordinates,
          year,
          PGDBQueryType: "geojson-parcels-distance",
        });

        // check to see if there is a distance of 0
        // which represents a target match
        console.log(pgData)
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
      case "zipcode":
        const { data } = await queries.queryPGDB({
          code,
          year,
          PGDBQueryType: "geojson-parcels-code",
        });

        clientData = data[0].jsonb_build_object; //geoJSON
        break;

      case "speculator":
        pgData = await queries.queryPGDB({
          ownid,
          year,
          PGDBQueryType: "geojson-parcels-ownid",
        });
        clientData = pgData.data[0].jsonb_build_object; //geoJSON
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

// router.get("/zipcodes", async (req, res) => {
//   try {
//     const { type, ownid, code, place, coordinates, year } = req.query;
//     let clientData;
//     if (["address"].includes(type)) {
//       const { data } = await queries.queryMapboxAPI({
//         place,
//         coordinates,
//         mbQueryType: "primary-place",
//       });
//       clientData = data;
//     } else if (["zipcode", "speculator"].includes(type)) {
//       const { data } = await queries.queryPGDB({
//         PGDBQueryType: `primary-${type}`,
//         code,
//         ownid,
//         coordinates,
//         year,
//       });
//       clientData = data;
//     } else {
//       clientData = null;
//     }

//     res.json(clientData);
//   } catch (err) {
//     const msg = `An error occurred executing zipcodes geoJSON query. Message: ${err}`;
//     console.error(msg);
//     res.status(404).send(msg);
//   }
// });

module.exports = router;
