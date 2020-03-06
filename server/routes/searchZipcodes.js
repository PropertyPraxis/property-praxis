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
    const query = `SELECT DISTINCT p.* FROM property as p
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

// export our router to be mounted by the parent application
module.exports = router;
