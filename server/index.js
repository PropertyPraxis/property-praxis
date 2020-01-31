const express = require("express");
const app = express();
const { Pool, Query } = require("pg");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

//cors
app.use(cors());

//general security
app.use(helmet());
app.disable("x-powered-by");

//logging
app.use(morgan("combined"));

//DB Connection
const CONNECTION_STRING = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: CONNECTION_STRING,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

//example query that returns geojson
let gjQuery = `SELECT jsonb_build_object(
  'type',     'FeatureCollection',
  'features', jsonb_agg(feature)
)
FROM (
  SELECT jsonb_build_object(
    'type',       'Feature',
    'id',         objectid,
    'geometry',   ST_AsGeoJSON(geometry)::json,
    'properties', to_jsonb(inputs) - 'geometry' - 'Shape__Area' - 'Shape__Length' - 'objectid'
  ) AS feature
  FROM (
    SELECT * FROM zips_geom LIMIT 10
  ) inputs
) features;`;

let gjParcels2017 = `SELECT jsonb_build_object(
  'type',     'FeatureCollection',
  'features', jsonb_agg(feature)
)
FROM (
  SELECT jsonb_build_object(
    'type',       'Feature',
    'id',          id,
    'geometry',   ST_AsGeoJSON(geom_2017)::json,
    'properties', to_jsonb(inputs) - 'geom_2017'
  ) AS feature
  FROM (
    SELECT * FROM parcels_2017
  ) inputs
) features;`;

let gjParcelsCentroid2017 = `SELECT jsonb_build_object(
  'type',     'FeatureCollection',
  'features', jsonb_agg(feature)
)
FROM (
  SELECT jsonb_build_object(
    'type',       'Feature',
    'geometry',   ST_AsGeoJSON(centroid)::json,
    'properties', to_jsonb(inputs) - 'centroid'
  ) AS feature
  FROM (
    SELECT * FROM parcels_centroid_2017 LIMIT 100
  ) inputs
) features;`;

let = gjParcelsTest = `SELECT * from parcels_gj;`;

let gjZips = `SELECT jsonb_build_object(
  'type',     'FeatureCollection',
  'features', jsonb_agg(feature)
)
FROM (
  SELECT jsonb_build_object(
    'type',       'Feature',
    'geometry',   ST_AsGeoJSON(geometry)::json,
    'properties', to_jsonb(inputs)
  ) AS feature
  FROM (
    SELECT * FROM zips_geom
  ) inputs
) features;`;

app.get("/api/zipcodes", (req, res) => {
  pool
    .query(gjZips)
    .then(queryRes => {
      console.log(queryRes);
      res.json(queryRes.rows[0].jsonb_build_object);
    })
    .catch(err =>
      setImmediate(() => {
        throw err;
      })
    );
});

app.get("/api/ppraxis", (req, res) => {
  pool
    .query(gjParcels2017)
    .then(queryRes => {
      console.log(queryRes);
      res.json(queryRes.rows[0].jsonb_build_object);
    })
    .catch(err =>
      setImmediate(() => {
        throw err;
      })
    );
});

app.listen(5000, () => {
  console.log("listening on port 5000");
});

// app.get("/test", (req, res) => {
//   client.connect();
//   client
//   .query('SELECT * FROM property LIMIT 10')
//   .then(res => console.log(res.rows[0]))
//   .catch(e => console.error(e.stack))

// });
// client
//   .query('SELECT * FROM property LIMIT 10')
//   .then(res => console.log(res.rows[0]))
//   .catch(e => console.error(e.stack))
// // client.end();

// pool.query(gjQuery, (err, dbRes) => {
//   console.log(err, dbRes);
//   res.json({ data: dbRes.rows[0] });
//   pool.end();
// });
// res.json({ message: "hello" });

// 1008790.001
//test queries
// let query = `SELECT ST_AsGeoJSON(geom_gj)::json as geometry, parcelno
//               FROM parcel_property_geom
//               LIMIT 100;`;
