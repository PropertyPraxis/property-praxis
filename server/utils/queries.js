const db = require("../db"); //index.js
const fetch = require("node-fetch");
const keys = require("../config/keys");

/*PG DB query types*/
const PRIMARY_ZIPCODE = "PRIMARY_ZIPCODE";
const PRIMARY_SPECULATOR = "PRIMARY_SPECULATOR";
const GEOJSON_ZIPCODES = "GEOJSON_ZIPCODES";
const GEOJSON_PARCELS_CODE = "GEOJSON_PARCELS_CODE";
const GEOJSON_PARCELS_OWNID = "GEOJSON_PARCELS_OWNID";
const GEOJSON_PARCELS_DISTANCE = "GEOJSON_PARCELS_DISTANCE";
const DETAILED_ADDRESS_YEARS = "DETAILED_ADDRESS_YEARS";
const SEARCHBAR_YEARS = "SEARCHBAR_YEARS";

/*Mapbox API query types*/
const GEOCODE = "GEOCODE"; // works for primary address as well
const REVERSE_GEOCODE = "REVERSE_GEOCODE";

async function queryPGDB({
  PGDBQueryType = null,
  code = null,
  ownid = null,
  coordinates = null,
  year,
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
          WHERE p.propzip LIKE '${code}%' AND y.praxisyear = '${year}'
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

      case GEOJSON_PARCELS_DISTANCE:
        // constant for search distance
        const searchRadius = 1000;

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

      case DETAILED_ADDRESS_YEARS: // need to rework this one to check other geom cols
        query = `SELECT DISTINCT y.praxisyear
          FROM parcel_property_geom AS ppg
          INNER JOIN property as p ON ppg.parprop_id = p.parprop_id
          INNER JOIN taxpayer_property AS tpp ON p.prop_id = tpp.prop_id
          INNER JOIN year AS y ON tpp.taxparprop_id = y.taxparprop_id
          INNER JOIN taxpayer as tp ON tpp.tp_id = tp.tp_id
          INNER JOIN owner_taxpayer as otp ON tp.owntax_id = otp.owntax_id
          WHERE ST_Intersects(
            ST_SetSRID(
              ST_MakePoint(${longitude}, ${latitude})::geography, 
            4326), 
          ppg.geom_gj::geography)
          ORDER BY y.praxisyear DESC;`; // geom_gj needs work here
        break;

      case SEARCHBAR_YEARS:
        query = `SELECT DISTINCT praxisyear FROM year 
          ORDER BY praxisyear DESC;`;
        break;

      case "address":
        query = `SELECT DISTINCT ROW_NUMBER() OVER (ORDER BY 1) as id, 
          ST_X(centroid) as longitude,
          own_id, count as property_count, 
          parcelno, propaddr, propno, propdir, propstr, propzip,
          resyrbuilt, saledate, saleprice, taxpayer1, totacres, totsqft, 
          ST_Y(centroid) as latitude
          FROM parcels_${year} 
          WHERE ST_Intersects(
            ST_SetSRID(
              ST_MakePoint(${longitude}, ${latitude}), 
            4326), 
          geom_${year})`;
        break;

      default:
        console.warn("Unknown SQL query type.");
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
  GEOJSON_PARCELS_OWNID,
  GEOJSON_PARCELS_DISTANCE,
  DETAILED_ADDRESS_YEARS,
  SEARCHBAR_YEARS,
  GEOCODE,
  REVERSE_GEOCODE,
};
