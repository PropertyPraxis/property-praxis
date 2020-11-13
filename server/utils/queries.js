const db = require("../db"); //index.js
const fetch = require("node-fetch");
const keys = require("../config/keys");

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
      case "primary-zipcode":
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

      case "primary-speculator":
        query = `SELECT * FROM owner_count
          WHERE own_id LIKE '${decodeURI(ownid).toUpperCase()}%'
          AND praxisyear = '${year}'
          AND count > 9
          ORDER BY count DESC
          LIMIT 5;`;
        break;

      case "geojson-zipcodes-all":
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

      case "geojson-parcels-code":
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

      case "geojson-parcels-ownid":
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

      case "geojson-parcels-distance":
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

      case "detailed-address-year": // need to rework this one to check other geom cols
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

      case "searchbar-years":
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
    console.log(`PG Query: ${query}`);
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
    let mbResponse, mbJSON;

    switch (mbQueryType) {
      case "primary-place":
        mbResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json?fuzzyMatch=true&bbox=-83.287959,42.25519197,-82.91043917,42.45023198&types=address,poi&access_token=${keys.MAPBOX_ACCESS_TOKEN}`
        );
        mbJSON = await mbResponse.json();
        const mb = mbJSON.features.map(({ place_name, geometry }) => ({
          place_name,
          geometry, //contains the coordinates
        }));
        return { data: mb };
      case "reverse-geocode":
        const { longitude, latitude } = JSON.parse(decodeURI(coordinates));
        mbResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${keys.MAPBOX_ACCESS_TOKEN}`
        );
        mbJSON = await mbResponse.json();
        const { place_name, geometry } = mbJSON.features[0];
        return { data: { place_name, geometry } };
      default:
        console.warn(`Unkown Mapbox query type: ${mbQueryType}`);
        return { data: `Unkown Mapbox query type: ${mbQueryType}` };
    }
  } catch (err) {
    console.error(`An error occurred executing MB query. Message: ${err}`);
  }
}
module.exports = { queryPGDB, queryMapboxAPI };
