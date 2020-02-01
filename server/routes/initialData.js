const Router = require("express-promise-router");
// const SQL = require("sql-template-strings");
const db = require("../db"); //index.js

const router = new Router();

router.get("/zipcodes", async (req, res) => {
  const query = `SELECT jsonb_build_object(
        'type',     'FeatureCollection',
        'features', jsonb_agg(feature)
      )
      FROM (
        SELECT jsonb_build_object(
          'type',       'Feature',
          'geometry',   ST_AsGeoJSON(geometry)::json,
          'properties', to_jsonb(inputs) - 'geometry'
        ) AS feature
        FROM (
          SELECT * FROM zips_geom
        ) inputs
      ) features;`;

  const { rows } = await db.templateQuery(query);
  res.send(rows[0].jsonb_build_object);
});

router.get("/parcels/:year", async (req, res) => {
  const { year } = req.params;

  const query = `SELECT jsonb_build_object(
    'type',     'FeatureCollection',
    'features', jsonb_agg(feature)
  )
  FROM (
    SELECT jsonb_build_object(
      'type',       'Feature',
      'id',          id,
      'geometry',   ST_AsGeoJSON(geom_${year})::json,
      'properties', to_jsonb(inputs) - 'geom_${year}'
    ) AS feature
    FROM (
      SELECT * FROM parcels_${year}
    ) inputs
  ) features;`;

  const { rows } = await db.templateQuery(query);
  res.send(rows[0].jsonb_build_object);
});

module.exports = router;

//example query that returns geojson
// let gjQuery = `SELECT jsonb_build_object(
//     'type',     'FeatureCollection',
//     'features', jsonb_agg(feature)
//   )
//   FROM (
//     SELECT jsonb_build_object(
//       'type',       'Feature',
//       'id',         objectid,
//       'geometry',   ST_AsGeoJSON(geometry)::json,
//       'properties', to_jsonb(inputs) - 'geometry' - 'Shape__Area' - 'Shape__Length' - 'objectid'
//     ) AS feature
//     FROM (
//       SELECT * FROM zips_geom LIMIT 10
//     ) inputs
//   ) features;`;

// let gjParcels2017 = `SELECT jsonb_build_object(
//     'type',     'FeatureCollection',
//     'features', jsonb_agg(feature)
//   )
//   FROM (
//     SELECT jsonb_build_object(
//       'type',       'Feature',
//       'id',          id,
//       'geometry',   ST_AsGeoJSON(geom_2017)::json,
//       'properties', to_jsonb(inputs) - 'geom_2017'
//     ) AS feature
//     FROM (
//       SELECT * FROM parcels_2017
//     ) inputs
//   ) features;`;

// let gjParcelsCentroid2017 = `SELECT jsonb_build_object(
//     'type',     'FeatureCollection',
//     'features', jsonb_agg(feature)
//   )
//   FROM (
//     SELECT jsonb_build_object(
//       'type',       'Feature',
//       'geometry',   ST_AsGeoJSON(centroid)::json,
//       'properties', to_jsonb(inputs) - 'centroid'
//     ) AS feature
//     FROM (
//       SELECT * FROM parcels_centroid_2017 LIMIT 100
//     ) inputs
//   ) features;`;

// let = gjParcelsTest = `SELECT * from parcels_gj;`;

// let gjZips = `SELECT jsonb_build_object(
//     'type',     'FeatureCollection',
//     'features', jsonb_agg(feature)
//   )
//   FROM (
//     SELECT jsonb_build_object(
//       'type',       'Feature',
//       'geometry',   ST_AsGeoJSON(geometry)::json,
//       'properties', to_jsonb(inputs) - 'geometry'
//     ) AS feature
//     FROM (
//       SELECT * FROM zips_geom
//     ) inputs
//   ) features;`;

// app.get("/api/zipcodes", (req, res) => {
//   pool
//     .query(gjZips)
//     .then(queryRes => {
//       console.log(queryRes);
//       res.json(queryRes.rows[0].jsonb_build_object);
//     })
//     .catch(err =>
//       setImmediate(() => {
//         throw err;
//       })
//     );
// });

// app.get("/api/ppraxis", (req, res) => {
//   pool
//     .query(gjParcels2017)
//     .then(queryRes => {
//       console.log(queryRes);
//       res.json(queryRes.rows[0].jsonb_build_object);
//     })
//     .catch(err =>
//       setImmediate(() => {
//         throw err;
//       })
//     );
// });
