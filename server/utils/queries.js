const db = require("../db"); //index.js
const fetch = require("node-fetch");
const keys = require("../config/keys");

/*PG DB query types*/
const PRIMARY_ZIPCODE = "PRIMARY_ZIPCODE";
const PRIMARY_SPECULATOR = "PRIMARY_SPECULATOR";
const GEOJSON_ZIPCODES = "GEOJSON_ZIPCODES";
const GEOJSON_ZIPCODES_PARCELS = "GEOJSON_ZIPCODES_PARCELS";
const GEOJSON_PARCELS_CODE = "GEOJSON_PARCELS_CODE";
const GEOJSON_PARCELS_CODE_OWNID = "GEOJSON_PARCELS_CODE_OWNID";
const GEOJSON_PARCELS_OWNID = "GEOJSON_PARCELS_OWNID";
const GEOJSON_PARCELS_OWNID_CODE = "GEOJSON_PARCELS_OWNID_CODE";
const GEOJSON_PARCELS_DISTANCE = "GEOJSON_PARCELS_DISTANCE";
const GEOJSON_PARCELS_CODE_DISTANCE = "GEOJSON_PARCELS_CODE_DISTANCE";
const DETAILED_RECORD_YEARS = "DETAILED_RECORD_YEARS"; // years for a praxis record
const AVAILABLE_PRAXIS_YEARS = "AVAILABLE_PRAXIS_YEARS"; // all the available search years
const SPECULATORS_BY_CODE = "SPECULATORS_BY_CODE";
const CODES_BY_SPECULATOR = "CODES_BY_SPECULATOR";
const POINT_CODE = "POINT_CODE"; // get the zipcode for a specific point
const SPECULATION_BY_CODE = "SPECULATION_BY_CODE";
const SPECULATION_BY_OWNID = "SPECULATION_BY_OWNID";
const SPECULATOR_BY_YEAR = "SPECULATOR_BY_YEAR"; //graph data
const SQL_QUERY_GENERAL = "SQL_QUERY_GENERAL";

/*Mapbox API query types*/
const GEOCODE = "GEOCODE"; // works for primary address as well
const REVERSE_GEOCODE = "REVERSE_GEOCODE";

/*All the queries for the db are managed in here.*/
async function queryPGDB({
  PGDBQueryType = null,
  code = null,
  ownid = null,
  coordinates = null,
  parpropid = null,
  searchYears = [2015, 2016, 2017, 2018, 2019, 2020, 2021],
  searchRadius = 1000,
  year = null,
  q = null,
}) {
  try {
    let query, longitude, latitude;

    if (coordinates) {
      const parsedCoordinates = JSON.parse(decodeURI(coordinates));
      longitude = parsedCoordinates.longitude;
      latitude = parsedCoordinates.latitude;
    }

    switch (PGDBQueryType) {
      case PRIMARY_ZIPCODE:
        query = `SELECT DISTINCT p.zipcode_sj AS propzip, AVG(oc.count) as avg_count
          FROM property as p
          INNER JOIN taxpayer_property AS tpp ON p.prop_id = tpp.prop_id
          INNER JOIN year AS y ON tpp.taxparprop_id = y.taxparprop_id
          INNER JOIN taxpayer as tp ON tpp.tp_id = tp.tp_id
          INNER JOIN owner_taxpayer AS otp ON tp.owntax_id = otp.owntax_id
          INNER JOIN owner_count as OC ON otp.own_id = oc.own_id
          WHERE p.zipcode_sj LIKE '${code}%' 
          AND y.praxisyear = '${year}'
          GROUP BY  p.zipcode_sj
          ORDER BY avg_count DESC
          LIMIT 5;
          `;
        break;

      case PRIMARY_SPECULATOR:
        query = `SELECT * FROM owner_count
          WHERE own_id LIKE '${decodeURI(ownid).toUpperCase()}%'
          AND praxisyear = '${year}'
          AND count > 9
          ORDER BY count DESC
          LIMIT 5;`;
        break;
      // add WHERE to query for all the intersecting zips/parcels
      case GEOJSON_ZIPCODES:
        query = `SELECT jsonb_build_object(
            'type',     'FeatureCollection',
            'features', jsonb_agg(feature)
          )
          FROM (
            SELECT jsonb_build_object(
              'type',       'Feature',
              'geometry',   ST_AsGeoJSON(geometry, 6)::json,
              'properties', to_jsonb(inputs) - 'geometry'
            ) AS feature
            FROM (
              SELECT * FROM zips_geom
            ) inputs
          ) features;`;
        break;

      case GEOJSON_ZIPCODES_PARCELS:
        query = `SELECT jsonb_build_object(
          'type',     'FeatureCollection',
          'features', jsonb_agg(feature)
        )
        FROM (
          SELECT jsonb_build_object(
            'type',       'Feature',
            'geometry',   ST_AsGeoJSON(geometry, 6)::json,
            'properties', to_jsonb(inputs) - 'geometry'
          ) AS feature
          FROM (
            SELECT DISTINCT z.geometry AS geometry, z.zipcode AS zipcode 
            FROM zips_geom AS z
            INNER JOIN parcels_${year} AS p ON ST_Intersects(geometry, p.geom_${year})
            ${createCodeSQLPredicate({ code, ownid, coordinates })}
            ) inputs
        ) features;`;
        break;

      case GEOJSON_PARCELS_CODE:
        query = `SELECT jsonb_build_object(
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
              SELECT * FROM parcels_${year} 
              WHERE propzip LIKE '%${code}%'
            ) inputs
          ) features;`;
        break;

      case GEOJSON_PARCELS_OWNID:
        query = `SELECT jsonb_build_object(
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
              SELECT * FROM parcels_${year} 
              WHERE own_id LIKE '%${decodeURI(ownid).toUpperCase()}%'
            ) inputs
          ) features;`;
        break;

      case GEOJSON_PARCELS_CODE_OWNID:
        query = `SELECT jsonb_build_object(
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
                SELECT * FROM parcels_${year} 
                WHERE propzip LIKE '%${code}%'
                AND own_id LIKE '%${decodeURI(ownid).toUpperCase()}%'
              ) inputs
            ) features;`;
        break;

      case GEOJSON_PARCELS_OWNID_CODE:
        query = `SELECT jsonb_build_object(
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
                SELECT * FROM parcels_${year} 
                WHERE own_id LIKE '%${decodeURI(ownid).toUpperCase()}%'
                AND propzip LIKE '%${code}%'
              ) inputs
            ) features;`;
        break;

      /*currenlty dead query - not used*/
      case GEOJSON_PARCELS_DISTANCE:
        query = `SELECT jsonb_build_object(
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
              SELECT *, ST_Distance(
                ST_SetSRID(
                  ST_MakePoint(${longitude}, ${latitude}),
                4326)::geography,
              geom_${year}::geography) AS distance
              FROM parcels_${year}
              WHERE ST_Distance(
                ST_SetSRID(
                  ST_MakePoint(${longitude}, ${latitude}),
                4326)::geography,
              geom_${year}::geography) < ${searchRadius}
            ) inputs
          ) features;`;
        break;

      case GEOJSON_PARCELS_CODE_DISTANCE:
        query = `SELECT jsonb_build_object(
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
            SELECT *, ST_Distance(
              ST_SetSRID(
                ST_MakePoint(${longitude}, ${latitude}),
              4326)::geography,
            geom_${year}::geography) AS distance
            FROM parcels_${year}
            WHERE propzip LIKE'${code}%'
          ) inputs
        ) features;`;
        break;

      case POINT_CODE:
        query = `SELECT * 
          FROM zips_geom AS z
          WHERE 
          ST_Intersects(
            ST_SetSRID(
              ST_MakePoint(${longitude}, ${latitude}),
            4326)::geography,
          z.geometry)`;
        break;

      // search for available geometry cols
      case DETAILED_RECORD_YEARS:
        const geomCols = searchYears
          .map(
            (year) => ` 
          CASE WHEN ST_AsText(geom_${year}) = 'GEOMETRYCOLLECTION EMPTY'
          THEN 'null'
          ELSE '${year}'
          END AS geom_${year}
          `
          )
          .join(", ");

        query = `SELECT
          ${geomCols}  
          FROM parcel_property_geom
          WHERE parprop_id = '${parpropid}'`;
        break;

      // all the years in the DB to search
      case AVAILABLE_PRAXIS_YEARS:
        query = `SELECT DISTINCT praxisyear FROM year 
          ORDER BY praxisyear DESC;`;
        break;

      case SPECULATORS_BY_CODE:
        query = `SELECT DISTINCT otp.own_id, oc.count
        FROM property as p
        INNER JOIN taxpayer_property AS tpp ON p.prop_id = tpp.prop_id
        INNER JOIN taxpayer as tp ON tpp.tp_id = tp.tp_id
        INNER JOIN owner_taxpayer AS otp ON tp.owntax_id = otp.owntax_id
        INNER JOIN owner_count as OC ON otp.own_id = oc.own_id
        WHERE p.zipcode_sj LIKE '${code}%'
        AND oc.praxisyear = '${year}'
        ORDER BY oc.count DESC
        LIMIT 5
        `;
        break;

      case CODES_BY_SPECULATOR:
        query = `SELECT DISTINCT p.zipcode_sj AS propzip,
          STRING_AGG(DISTINCT ot.own_id, ',') AS own_id, COUNT(ot.own_id) AS count
          FROM parcel_property_geom AS ppg
          INNER JOIN property AS p ON ppg.parprop_id = p.parprop_id
          INNER JOIN taxpayer_property AS tp ON p.prop_id = tp.prop_id
          INNER JOIN year AS y on tp.taxparprop_id = y.taxparprop_id
          INNER JOIN taxpayer AS t ON tp.tp_id = t.tp_id
          INNER JOIN owner_taxpayer AS ot ON t.owntax_id = ot.owntax_id
          WHERE ot.own_id LIKE '${decodeURI(ownid).toUpperCase()}%'
          AND y.praxisyear = '${year}'
          GROUP BY p.zipcode_sj, ot.own_id
          ORDER BY count DESC;
        `;
        break;

      case SPECULATION_BY_CODE:
        /*Query to  get the rate of speculation in a zipcode.*/
        query = `SELECT y.own_id, y.count, y.total,
        (y.count::float / y.total::float) * 100 AS per
         FROM 
        (SELECT SUM(x.count)::INT as count, x.own_id as own_id, x.total
          FROM
            (SELECT DISTINCT own_id, COUNT(own_id)::INT as count,
            (SELECT COUNT(feature_id) FROM parcels_${year}
            WHERE propzip LIKE '%${code}%' )::INT AS total 
            FROM parcels_${year}
            WHERE propzip LIKE '%${code}%'
            GROUP BY own_id) x
          GROUP BY own_id, total
          ORDER BY count DESC ) y;`;

        break;

      case SPECULATION_BY_OWNID:
        /*Search speculation by own_id in each zipcode.*/
        query = `SELECT DISTINCT 
        x.own_id, x.count::int, x.propzip, y.total::int,
        (x.count::float / y.total::float) * 100 AS per
        FROM (
          SELECT DISTINCT COUNT(ppg1.geom_${year}) AS count, 
          ot1.own_id AS own_id, p1.zipcode_sj AS propzip
          FROM parcel_property_geom AS ppg1
          INNER JOIN property AS p1 ON ppg1.parprop_id = p1.parprop_id
          INNER JOIN taxpayer_property AS tp1 ON p1.prop_id = tp1.prop_id
          INNER JOIN year AS y1 on tp1.taxparprop_id = y1.taxparprop_id
          INNER JOIN taxpayer AS t1 ON tp1.tp_id = t1.tp_id
          INNER JOIN owner_taxpayer AS ot1 ON t1.owntax_id = ot1.owntax_id
          WHERE ot1.own_id LIKE '%${ownid}%'
          AND y1.praxisyear = '${year}'
          GROUP BY ot1.own_id, p1.zipcode_sj
        ) x 
        INNER JOIN (
          SELECT DISTINCT COUNT(ppg2.geom_${year}) AS total, 
          p2.zipcode_sj AS propzip
          FROM parcel_property_geom AS ppg2
          INNER JOIN property AS p2 ON ppg2.parprop_id = p2.parprop_id
          INNER JOIN taxpayer_property AS tp2 ON p2.prop_id = tp2.prop_id
          INNER JOIN year AS y2 on tp2.taxparprop_id = y2.taxparprop_id
          INNER JOIN taxpayer AS t2 ON tp2.tp_id = t2.tp_id
          INNER JOIN owner_taxpayer AS ot2 ON t2.owntax_id = ot2.owntax_id
          AND y2.praxisyear = '${year}'
          GROUP BY p2.zipcode_sj
          ) y ON x.propzip = y.propzip
          ORDER BY propzip, own_id, count;`;
        break;

      case SPECULATOR_BY_YEAR:
        /*Search property count by own_id by year*/
        query = `SELECT DISTINCT COUNT(ot.own_id),
          ot.own_id, y.praxisyear
          FROM owner_taxpayer AS ot
          INNER JOIN taxpayer AS tp
          ON ot.owntax_id = tp.owntax_id
          INNER JOIN taxpayer_property AS tpp
          ON tp.tp_id = tpp.tp_id
          INNER JOIN year AS y 
          ON tpp.taxparprop_id = y.taxparprop_id
          WHERE ot.own_id = '${ownid}'
          GROUP BY ot.own_id, y.praxisyear`;

        break;

      case SQL_QUERY_GENERAL:
        query = q;
        break;

      default:
        console.error(`Unknown SQL query type: ${type}`);
        break;
    }
    console.log(`DB Query: ${query}`);
    const { rows } = await db.query(query);
    return { data: rows };
  } catch (err) {
    const query = "UNKNOWN QUERY";
    console.error(
      `An error occurred executing SQL query type$: ${PGDBQueryType}, 
      query: ${query}. Message: ${err}`
    );
  }
}

async function queryMapboxAPI({ coordinates, place, mbQueryType }) {
  try {
    let mbResponse, mbJSON, APIRequest;

    switch (mbQueryType) {
      case GEOCODE:
        APIRequest = `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json?fuzzyMatch=true&bbox=-83.287959,42.25519197,-82.91043917,42.45023198&types=address,poi&access_token=${keys.MAPBOX_ACCESS_TOKEN}`;
        console.log(`MBAPIRequest: ${APIRequest}`);
        mbResponse = await fetch(APIRequest);
        mbJSON = await mbResponse.json();
        const mb = mbJSON.features.map(({ place_name, geometry }) => ({
          place_name,
          geometry, //contains the coordinates
        }));
        return { data: mb };

      case REVERSE_GEOCODE:
        const { longitude, latitude } = JSON.parse(decodeURI(coordinates));
        APIRequest = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${keys.MAPBOX_ACCESS_TOKEN}`;
        console.log(`MBAPIRequest: ${APIRequest}`);
        mbResponse = await fetch(APIRequest);
        mbJSON = await mbResponse.json();
        const { place_name, geometry } = mbJSON.features[0];
        return { data: { place_name, geometry } };

      default:
        console.error(`Unkown Mapbox query type: ${mbQueryType}`);
        return { data: `Unkown Mapbox query type: ${mbQueryType}` };
    }
  } catch (err) {
    console.error(`An error occurred executing MB query. Message: ${err}`);
  }
}

/*String helper function*/
function createCodeSQLPredicate({
  code = null,
  ownid = null,
  coordinates = null,
}) {
  if (code) {
    return `WHERE p.propzip LIKE '%${code}%'`;
  } else if (ownid) {
    return `WHERE p.own_id LIKE '%${decodeURI(ownid).toUpperCase()}%'`;
  } else if (ownid && code) {
    return `WHERE p.own_id LIKE '%${decodeURI(ownid).toUpperCase()}%'
            AND p.propzip LIKE '%${code}%'`;
  } else if (coordinates) {
    const { longitude, latitude } = JSON.parse(decodeURI(coordinates));
    return `WHERE 
    ST_Intersects(
      ST_SetSRID(
        ST_MakePoint(${longitude}, ${latitude}),
      4326)::geography,
    z.geometry)`;
  } else {
    return "";
  }
}

module.exports = {
  queryPGDB,
  queryMapboxAPI,
  PRIMARY_ZIPCODE,
  PRIMARY_SPECULATOR,
  GEOJSON_ZIPCODES,
  GEOJSON_ZIPCODES_PARCELS,
  GEOJSON_PARCELS_CODE,
  GEOJSON_PARCELS_CODE_OWNID,
  GEOJSON_PARCELS_OWNID,
  GEOJSON_PARCELS_OWNID_CODE,
  GEOJSON_PARCELS_DISTANCE,
  GEOJSON_PARCELS_CODE_DISTANCE,
  POINT_CODE,
  DETAILED_RECORD_YEARS,
  AVAILABLE_PRAXIS_YEARS,
  GEOCODE,
  REVERSE_GEOCODE,
  SPECULATORS_BY_CODE,
  CODES_BY_SPECULATOR,
  SPECULATION_BY_CODE,
  SPECULATION_BY_OWNID,
  SPECULATOR_BY_YEAR,
  SQL_QUERY_GENERAL,
};
