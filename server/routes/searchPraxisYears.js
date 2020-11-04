const Router = require("express-promise-router");
const db = require("../db"); //index.js
const router = new Router();

router.get("/", async (req, res) => {
  try {
    const query =
      "SELECT DISTINCT praxisyear FROM year ORDER BY praxisyear DESC;";
    const { rows } = await db.templateQuery(query);

    res.json(rows);
  } catch (err) {
    res.json(err);
  }
});

router.get("/address/:coords", async (req, res) => {
  const { coords } = req.params;
  const { longitude, latitude } = JSON.parse(decodeURI(coords));

  console.log("hello", longitude, latitude);
  try {
    const query = `SELECT DISTINCT y.praxisyear
    FROM parcel_property_geom AS ppg
    INNER JOIN property as p ON ppg.parprop_id = p.parprop_id
    INNER JOIN taxpayer_property AS tpp ON p.prop_id = tpp.prop_id
    INNER JOIN year AS y ON tpp.taxparprop_id = y.taxparprop_id
    INNER JOIN taxpayer as tp ON tpp.tp_id = tp.tp_id
    INNER JOIN owner_taxpayer as otp ON tp.owntax_id = otp.owntax_id
    WHERE ST_Intersects(ST_SetSRID(ST_MakePoint(${longitude}, ${latitude})::geography, 4326), ppg.geom_${2017}::geography)
    ORDER BY y.praxisyear DESC;`;
    const { rows } = await db.templateQuery(query);

    res.json(rows);
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
