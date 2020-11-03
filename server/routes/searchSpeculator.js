const Router = require("express-promise-router");
const db = require("../db"); //index.js

const router = new Router();

router.get("/partial/:id/:year", async (req, res) => {
  const { id, year } = req.params;
  const decodeId = decodeURI(id).toUpperCase();
  try {
    //   WHERE levenshtein(own_id, $1) <= 2
    const query = `SELECT * FROM owner_count
                WHERE own_id LIKE $1
                AND praxisyear = $2
                AND count > 9
                ORDER BY count DESC
                LIMIT 5;`;

    const { rows } = await db.query(query, [`%${decodeId}%`, year]);
    res.json(rows);
  } catch (err) {
    res.json(err);
  }
});

router.get("/full/:id/:year", async (req, res) => {
  const { id, year } = req.params;

  try {
    const query = `SELECT DISTINCT p.*, otp.own_id FROM property as p
    INNER JOIN taxpayer_property AS tpp ON p.prop_id = tpp.prop_id
    INNER JOIN year AS y ON tpp.taxparprop_id = y.taxparprop_id
    INNER JOIN taxpayer as tp ON tpp.tp_id = tp.tp_id
    INNER JOIN owner_taxpayer as otp ON tp.owntax_id = otp.owntax_id
    WHERE otp.own_id LIKE $1 AND y.praxisyear = $2`;

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
    FROM parcels_${year} WHERE own_id LIKE $1;`;

    const { rows } = await db.query(query, [`%${id}%`]);
    res.json(rows);
  } catch (err) {
    //could use some better error handling
    res.json(err);
  }
});

module.exports = router;

// FOR FULL QUERY
// const query = `SELECT DISTINCT otp.own_id
// FROM owner_taxpayer AS otp
// INNER JOIN taxpayer as tp ON otp.owntax_id = tp.owntax_id
// INNER JOIN taxpayer_property as tpp ON tp.tp_id = tpp.tp_id
// INNER JOIN year AS y ON tpp.taxparprop_id = y.taxparprop_id
// WHERE levenshtein(otp.own_id, $1) <= 2
// OR otp.own_id LIKE $2
// AND y.praxisyear = $3`;
