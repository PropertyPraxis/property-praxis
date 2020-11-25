const db = require("../db"); //index.js
const fetch = require("node-fetch");
const keys = require("../config/keys");

/*PG DB query types*/
const PRIMARY_ZIPCODE = "PRIMARY_ZIPCODE";
const PRIMARY_SPECULATOR = "PRIMARY_SPECULATOR";
const GEOJSON_ZIPCODES = "GEOJSON_ZIPCODES";
const GEOJSON_PARCELS_CODE = "GEOJSON_PARCELS_CODE";
const GEOJSON_PARCELS_CODE_OWNID = "GEOJSON_PARCELS_CODE_OWNID";
const GEOJSON_PARCELS_OWNID = "GEOJSON_PARCELS_OWNID";
const GEOJSON_PARCELS_OWNID_CODE = "GEOJSON_PARCELS_OWNID_CODE";
const GEOJSON_PARCELS_DISTANCE = "GEOJSON_PARCELS_DISTANCE";
const DETAILED_RECORD_YEARS = "DETAILED_RECORD_YEARS"; // years for a praxis record
const AVAILABLE_PRAXIS_YEARS = "AVAILABLE_PRAXIS_YEARS"; // all the available search years
const SPECULATORS_BY_CODE = "SPECULATORS_BY_CODE";
const CODES_BY_SPECULATOR = "CODES_BY_SPECULATOR";

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
  searchYears = [2015, 2016, 2017, 2018, 2019, 2020],
  searchRadius = 1000,
  year = null,
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
        query = `SELECT DISTINCT p.propzip, AVG(oc.count) as avg_count
          FROM property as p
          INNER JOIN taxpayer_property AS tpp ON p.prop_id = tpp.prop_id
          INNER JOIN year AS y ON tpp.taxparprop_id = y.taxparprop_id
          INNER JOIN taxpayer as tp ON tpp.tp_id = tp.tp_id
          INNER JOIN owner_taxpayer AS otp ON tp.owntax_id = otp.owntax_id
          INNER JOIN owner_count as OC ON otp.own_id = oc.own_id
          WHERE p.propzip LIKE '${code}%' 
          AND y.praxisyear = '${year}'
          GROUP BY  p.propzip
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
        WHERE p.propzip LIKE '${code}%'
        AND oc.praxisyear = '${year}'
        ORDER BY oc.count DESC
        LIMIT 5
        `;
        break;

      case CODES_BY_SPECULATOR:
        query = `SELECT DISTINCT p.propzip,
          STRING_AGG(DISTINCT ot.own_id, ',') AS own_id, COUNT(ot.own_id) AS count
          FROM parcel_property_geom AS ppg
          INNER JOIN property AS p ON ppg.parprop_id = p.parprop_id
          INNER JOIN taxpayer_property AS tp ON p.prop_id = tp.prop_id
          INNER JOIN year AS y on tp.taxparprop_id = y.taxparprop_id
          INNER JOIN taxpayer AS t ON tp.tp_id = t.tp_id
          INNER JOIN owner_taxpayer AS ot ON t.owntax_id = ot.owntax_id
          WHERE ot.own_id LIKE '${decodeURI(ownid).toUpperCase()}%'
          AND y.praxisyear = '${year}'
          GROUP BY p.propzip, ot.own_id
          ORDER BY count DESC
          LIMIT 5;
        `;
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

module.exports = {
  queryPGDB,
  queryMapboxAPI,
  PRIMARY_ZIPCODE,
  PRIMARY_SPECULATOR,
  GEOJSON_ZIPCODES,
  GEOJSON_PARCELS_CODE,
  GEOJSON_PARCELS_CODE_OWNID,
  GEOJSON_PARCELS_OWNID,
  GEOJSON_PARCELS_OWNID_CODE,
  GEOJSON_PARCELS_DISTANCE,
  DETAILED_RECORD_YEARS,
  AVAILABLE_PRAXIS_YEARS,
  GEOCODE,
  REVERSE_GEOCODE,
  SPECULATORS_BY_CODE,
  CODES_BY_SPECULATOR,
};
