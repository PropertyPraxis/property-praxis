const Router = require("express-promise-router");
const db = require("../db"); //index.js

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router();

//route for full data
router.get("/full/:id/:year", async (req, res) => {
  const { id, year } = req.params;

  try {
    // const query = `SELECT DISTINCT p.* FROM property as p
    // INNER JOIN taxpayer_property AS tpp ON p.prop_id = tpp.prop_id
    // INNER JOIN year AS y ON tpp.taxparprop_id = y.taxparprop_id
    // WHERE p.propzip LIKE $1 AND y.praxisyear = $2`;

    const query = `SELECT jsonb_build_object(
      'type',     'FeatureCollection',
      'features', jsonb_agg(feature)
    )
    FROM (
      SELECT jsonb_build_object(
        'type',       'Feature',
        'id',          feature_id,
        'geometry',   ST_AsGeoJSON(geom_${year}, 6)::json,
        'properties', to_jsonb(inputs) - 'geom_${year}'
        'centroid',   ST_AsText(centroid, 6)::json
      ) AS feature
      FROM (
        SELECT *, ST_Distance(ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, geom_${year}::geography) AS distance 
        FROM parcels_${year} WHERE 
        ST_Distance(ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, geom_${year}::geography) < 1000
      ) inputs
    ) features;`;

    const { rows } = await db.query(query, [`${id}%`, `${year}`]);
    res.json(rows);
  } catch (err) {
    //could use some better error handling
    res.json(err);
  }
});

//route for zips only
router.get("/partial/:id/:year", async (req, res) => {
  const { id, year } = req.params;

  try {
    const query = `SELECT DISTINCT p.propzip FROM property as p
    INNER JOIN taxpayer_property AS tpp ON p.prop_id = tpp.prop_id
    INNER JOIN year AS y ON tpp.taxparprop_id = y.taxparprop_id
    WHERE p.propzip LIKE $1 AND y.praxisyear = $2`;

    const { rows } = await db.query(query, [`${id}%`, `${year}`]);
    res.json(rows);
  } catch (err) {
    //could use some better error handling
    res.json(err);
  }
});

router.get("/download/:id/:year", async (req, res) => {
  const { id, year } = req.params;
  try {
    const query = `SELECT DISTINCT ROW_NUMBER() OVER (ORDER BY 1) as id, ST_X(centroid) as longitude, 
    own_id, count as property_count, parcelno, propaddr, propno, propdir, propstr, propzip,
    resyrbuilt, saledate, saleprice, taxpayer1, totacres, totsqft, ST_Y(centroid) as latitude
    FROM parcels_${year} WHERE propzip LIKE $1;`;

    const { rows } = await db.query(query, [`%${id}%`]);
    res.json(rows);
  } catch (err) {
    //could use some better error handling
    res.json(err);
  }
});

// export our router to be mounted by the parent application
module.exports = router;

// centroid: "0101000020E610000000F64C14AFC454C0723CC7DFE8384540"
// cityrbuilt: 0
// count: 34
// distance: 351.81060379
// feature_id: 567
// own_id: "ANTWAYNE JOHNSON"
// parcelno: "13023909."
// praxisyear: 2017
// propaddr: "20237 MITCHELL"
// propdir: null
// propno: 20237
// propstr: "MITCHELL"
// propzip: "48234"
// resyrbuilt: 1947
// row.names: "95285"
// saledate: "11/20/2015"
// saleprice: 10
// taxparprop_id: "tpp-87299"
// taxpayer1: "ANTWYANE JOHNSON"
// totacres: 0.095
// totsqft: 4138
