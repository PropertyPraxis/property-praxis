const Router = require("express-promise-router");
const db = require("../db"); //index.js
const findTargetAddress = require("../utils/helper").findTargetAddress;
const buildGeoJSONTemplate = require("../utils/helper").buildGeoJSONTemplate;
const router = new Router();

router.get("/zipcode/:id/:year", async (req, res) => {
  const { id, year } = req.params;

  const query = `SELECT jsonb_build_object(
    'type',     'FeatureCollection',
    'features', jsonb_agg(feature)
  )
  FROM (
    SELECT jsonb_build_object(
      'type',       'Feature',
      'geometry',   ST_AsGeoJSON(geom_${year}, 6)::json,
      'properties', to_jsonb(inputs) - 'geom_${year}',
      'centroid',   ST_AsText(centroid)
    ) AS feature
    FROM (
      SELECT * FROM parcels_${year} WHERE propzip LIKE '%${id}%'
    ) inputs
  ) features;`;

  const { rows } = await db.templateQuery(query);
  res.send(rows[0].jsonb_build_object);
});

router.get("/speculator/:id/:year", async (req, res) => {
  const { id, year } = req.params;

  const query = `SELECT jsonb_build_object(
    'type',     'FeatureCollection',
    'features', jsonb_agg(feature)
  )
  FROM (
    SELECT jsonb_build_object(
      'type',       'Feature',
      'geometry',   ST_AsGeoJSON(geom_${year}, 6)::json,
      'properties', to_jsonb(inputs) - 'geom_${year}',
      'centroid',   ST_AsText(centroid)
    ) AS feature
    FROM (
      SELECT * FROM parcels_${year} WHERE own_id LIKE '%${id.toUpperCase()}%'
    ) inputs
  ) features;`;

  const { rows } = await db.templateQuery(query);
  res.send(rows[0].jsonb_build_object);
});

router.get("/address/:coords/:year", async (req, res) => {
  try {
    const { coords, year } = req.params;
    const { longitude, latitude } = JSON.parse(decodeURI(coords));

    // constant for search distance of nearby addresses
    const searchRadius = 1000;

    // query to find parcels within a distance
    // return geojson
    const query = `SELECT jsonb_build_object(
    'type',     'FeatureCollection',
    'features', jsonb_agg(feature)
  )
  FROM (
    SELECT jsonb_build_object(
      'type',       'Feature',
      'id',          feature_id,
      'geometry',   ST_AsGeoJSON(geom_${year}, 6)::json,
      'properties', to_jsonb(inputs) - 'geom_${year}',
      'centroid',   ST_AsText(centroid)
    ) AS feature
    FROM (
      SELECT *, ST_Distance(ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, geom_${year}::geography) AS distance 
      FROM parcels_${year} WHERE 
      ST_Distance(ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, geom_${year}::geography) < ${searchRadius}
    ) inputs
  ) features;`;

    const { rows } = await db.templateQuery(query);

    // check to see if there is a distance of 0
    const { features } = rows[0].jsonb_build_object;

    // returns arrays
    const { targetAddress, nearbyAddresses } = findTargetAddress(features);

    let geoJSON;
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

    res.send(geoJSON);
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;
