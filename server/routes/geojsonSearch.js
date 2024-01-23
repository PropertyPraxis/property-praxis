const Router = require("express-promise-router")
const queries = require("../utils/queries")
const {
  checkEmptyGeoJSON,
  buildGeoJSONTemplate,
  findTargetAddress,
} = require("../utils/geojson")
const router = new Router()

router.get("/", async (req, res) => {
  try {
    const {
      type,
      ownid = null,
      code = null,
      place = null,
      coordinates = null,
      year = "2021",
    } = req.query

    let pgData, geoJSON, clientData, praxisDataType
    /* eslint-disable no-case-declarations */
    switch (type) {
      case "parcels-by-geocode":
        // return geoJSON dependent on coverage
        const { data } = await queries.queryPGDB({
          place,
          coordinates,
          PGDBQueryType: queries.POINT_CODE,
        })

        let zipcode
        if (data[0]) {
          zipcode = data[0].zipcode
        } else {
          zipcode = null
        }

        pgData = await queries.queryPGDB({
          code: zipcode,
          coordinates,
          year,
          PGDBQueryType: queries.GEOJSON_PARCELS_CODE_DISTANCE,
        })

        // check to see if there is a distance of 0
        // which represents a target match
        const { features } = pgData.data[0].jsonb_build_object

        // returns arrays
        const { targetAddress, nearbyAddresses } = findTargetAddress(features)

        if (targetAddress.length === 0 && nearbyAddresses.length === 0) {
          // this is a default empty geojson
          // where there is no features returned
          geoJSON = buildGeoJSONTemplate([])
          praxisDataType = "parcels-by-geocode:empty"
        } else if (targetAddress.length > 0) {
          geoJSON = buildGeoJSONTemplate(targetAddress)
          praxisDataType = "parcels-by-geocode:single-parcel"
        } else if (targetAddress.length === 0 && nearbyAddresses.length > 0) {
          geoJSON = buildGeoJSONTemplate(nearbyAddresses)
          praxisDataType = "parcels-by-geocode:multiple-parcels"
        } else {
          geoJSON = buildGeoJSONTemplate([])
          praxisDataType = "parcels-by-geocode:empty"
        }
        clientData = geoJSON
        break

      case "parcels-by-code":
        pgData = await queries.queryPGDB({
          code,
          year,
          PGDBQueryType: queries.GEOJSON_PARCELS_CODE,
        })

        geoJSON = pgData.data[0].jsonb_build_object
        clientData = checkEmptyGeoJSON(geoJSON)
        praxisDataType = "parcels-by-code"
        break

      case "parcels-by-speculator":
        pgData = await queries.queryPGDB({
          ownid,
          year,
          PGDBQueryType: queries.GEOJSON_PARCELS_OWNID,
        })

        geoJSON = pgData.data[0].jsonb_build_object
        clientData = checkEmptyGeoJSON(geoJSON)
        praxisDataType = "parcels-by-speculator"
        break

      case "parcels-by-code-speculator":
        pgData = await queries.queryPGDB({
          code,
          ownid,
          year,
          PGDBQueryType: queries.GEOJSON_PARCELS_CODE_OWNID,
        })

        geoJSON = pgData.data[0].jsonb_build_object
        clientData = checkEmptyGeoJSON(geoJSON)
        praxisDataType = "parcels-by-code-speculator"
        break

      case "parcels-by-speculator-code":
        pgData = await queries.queryPGDB({
          ownid,
          code,
          year,
          PGDBQueryType: queries.GEOJSON_PARCELS_OWNID_CODE,
        })

        geoJSON = pgData.data[0].jsonb_build_object
        clientData = checkEmptyGeoJSON(geoJSON)
        praxisDataType = "parcels-by-speculator-code"
        break

      case "zipcode-all": // this shoudl be reowrked to hanlde "codes"
        pgData = await queries.queryPGDB({
          PGDBQueryType: queries.GEOJSON_ZIPCODES,
        })

        geoJSON = pgData.data[0].jsonb_build_object
        clientData = checkEmptyGeoJSON(geoJSON)
        praxisDataType = "zipcode-all"
        break

      case "zipcode-intersect": // this should be reowrked to hanlde "codes"
        pgData = await queries.queryPGDB({
          PGDBQueryType: queries.GEOJSON_ZIPCODES_PARCELS,
          ownid,
          code,
          coordinates,
          year,
        })

        geoJSON = pgData.data[0].jsonb_build_object
        clientData = checkEmptyGeoJSON(geoJSON)
        praxisDataType = "zipcode-intersect"
        break

      default:
        clientData = null
        break
    }
    clientData.praxisDataType = praxisDataType
    res.json(clientData)
  } catch (err) {
    const msg = `An error occurred executing parcels geoJSON query. Message: ${err}`
    console.error(msg)
    res.status(500).send(msg)
  }
})

module.exports = router
