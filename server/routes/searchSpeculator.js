const Router = require("express-promise-router");
const db = require("../db"); //index.js

const router = new Router();

router.get("/partial/:id/:year", async (req, res) => {
  const { id, year } = req.params;

  const decodeId = decodeURI(id).toUpperCase();

//   WHERE levenshtein(own_id, $1) <= 2
  const query = `SELECT * FROM owner_count
                WHERE own_id LIKE $1
                AND praxisyear = $2
                ORDER BY count DESC;`;

  const { rows } = await db.query(query, [`%${decodeId}%`, year]);
  res.json(rows);
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
