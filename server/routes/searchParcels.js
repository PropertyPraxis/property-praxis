const Router = require("express-promise-router");
const db = require("../db"); //index.js

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
      'id',          id,
      'geometry',   ST_AsGeoJSON(geom_${year}, 6)::json,
      'properties', to_jsonb(inputs) - 'geom_${year}'
    ) AS feature
    FROM (
      SELECT * FROM parcels_${year} WHERE propzip = '${id}'
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
      'id',          id,
      'geometry',   ST_AsGeoJSON(geom_${year}, 6)::json,
      'properties', to_jsonb(inputs) - 'geom_${year}'
    ) AS feature
    FROM (
      SELECT * FROM parcels_${year} WHERE own_id = '${id}'
    ) inputs
  ) features;`;

  const { rows } = await db.templateQuery(query);
  res.send(rows[0].jsonb_build_object);
});

module.exports = router;
