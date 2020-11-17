const Router = require("express-promise-router");
const db = require("../db"); //index.js
const fetch = require("node-fetch");
const keys = require("../config/keys");

const router = new Router();

router.get("/reverse-geocode/:coords", async (req, res) => {
  const { coords } = req.params;
  const { longitude, latitude } = JSON.parse(decodeURI(coords));

  try {
    const mbResponse = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${keys.MAPBOX_ACCESS_TOKEN}`
    );
    const mbJson = await mbResponse.json();
    const mbFeature = mbJson.features[0];
    const { place_name, geometry } = mbFeature;
    res.json({ place_name, geometry });
  } catch (err) {
    res.json(err);
  }
});

// router.get("/partial/:id/:year", async (req, res) => {
//   const { id } = req.params;
//   // const decodeId = decodeURI(id).toUpperCase();

//   try {
//     //   query the MB Geocoder APIz`
//     const mbResponse = await fetch(
//       `https://api.mapbox.com/geocoding/v5/mapbox.places/${id}.json?fuzzyMatch=true&bbox=-83.287959,42.25519197,-82.91043917,42.45023198&types=address,poi&access_token=${keys.MAPBOX_ACCESS_TOKEN}`
//     );
//     const mbJson = await mbResponse.json();
//     const mbFeatures = mbJson.features;
//     const mb = mbFeatures.map(({ place_name, geometry }) => ({
//       place_name,
//       geometry, //contains the coordinates
//     }));
//     res.json(mb);
//   } catch (err) {
//     res.json(err);
//   }
// });

router.get("/full/:coords/:year", async (req, res) => {
  const { coords, year } = req.params;
  const { longitude, latitude } = JSON.parse(decodeURI(coords));

  try {
    const query = `SELECT DISTINCT p.*, otp.own_id 
    FROM parcel_property_geom AS ppg
    INNER JOIN property as p ON ppg.parprop_id = p.parprop_id
    INNER JOIN taxpayer_property AS tpp ON p.prop_id = tpp.prop_id
    INNER JOIN year AS y ON tpp.taxparprop_id = y.taxparprop_id
    INNER JOIN taxpayer as tp ON tpp.tp_id = tp.tp_id
    INNER JOIN owner_taxpayer as otp ON tp.owntax_id = otp.owntax_id
    WHERE y.praxisyear = $1 AND
    ST_Intersects(ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ppg.geom_${year})`;

    console.log(query);

    const { rows } = await db.query(query, [`${year}`]);

    res.json(rows);
  } catch (err) {
    res.json(err);
  }
});

router.get("/download/:coords/:year", async (req, res) => {
  const { coords, year } = req.params;
  const { longitude, latitude } = JSON.parse(decodeURI(coords));

  try {
    const query = `SELECT DISTINCT ROW_NUMBER() OVER (ORDER BY 1) as id, ST_X(centroid) as longitude,
      own_id, count as property_count, parcelno, propaddr, propno, propdir, propstr, propzip,
      resyrbuilt, saledate, saleprice, taxpayer1, totacres, totsqft, ST_Y(centroid) as latitude
      FROM parcels_${year} 
      WHERE ST_Intersects(ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), geom_${year})`;

    const { rows } = await db.query(query);

    // query again if the result is 0
    if (rows.length === 0) {
      const query = `SELECT DISTINCT ROW_NUMBER() OVER (ORDER BY 1) as id, ST_X(centroid) as longitude,
      own_id, count as property_count, parcelno, propaddr, propno, propdir, propstr, propzip,
      resyrbuilt, saledate, saleprice, taxpayer1, totacres, totsqft, ST_Y(centroid) as latitude
      FROM parcels_${year} 
      WHERE ST_Distance(ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, geom_${year}::geography) < 1000;`;
      const { rows } = await db.query(query);
      res.json(rows);
    }

    res.json(rows);
  } catch (err) {
    //could use some better error handling
    res.json(err);
  }
});

// export our router to be mounted by the parent application
module.exports = router;

////////////////////////////////////////
// query the db
// Note this may need to be shifted to be a view on db creation
// const query = `SELECT ppg.parcelno, CONCAT( (p.propno || ' ' ||
//                 CASE WHEN p.propdir = '0' THEN '' ELSE p.propdir END),
//                 (p.propstr || ', '), 'Detroit, Michigan ', (p.propzip) ) AS address
//                 FROM property AS p
//                 INNER JOIN parcel_property_geom AS ppg ON p.parprop_id = ppg.parprop_id
//                 INNER JOIN taxpayer_property AS tpp ON p.prop_id = tpp.prop_id
//                 INNER JOIN year AS y ON tpp.taxparprop_id = y.taxparprop_id
//                 WHERE levenshtein( (p.propno || ' ' ||
//                 CASE WHEN p.propdir = '0' THEN '' ELSE p.propdir END
//                 || p.propstr || ', DETROIT, MICHIGAN ' || p.propzip), $1) <= 5
//                 OR (p.propno || ' ' ||
//                 CASE WHEN p.propdir = '0' THEN '' ELSE p.propdir END
//                 || p.propstr || ', DETROIT, MICHIGAN ' || p.propzip) LIKE $2
//                 AND y.praxisyear = $3`;

// const { rows } = await db.query(query, [decodeId, `${decodeId}%`, year]);
// return an array
// res.json([{ mb: mbFeatures }, { db: rows }]);
////////////////////////////////////////
