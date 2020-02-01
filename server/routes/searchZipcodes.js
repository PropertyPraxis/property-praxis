const Router = require("express-promise-router");
const db = require("../db"); //index.js

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query(
    "SELECT * FROM zips_geom WHERE zipcode = $1",
    [id]
  );
  res.send(rows[0]);
});

// export our router to be mounted by the parent application
module.exports = router;
