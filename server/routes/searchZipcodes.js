const Router = require("express-promise-router");
const db = require("../db"); //index.js

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router();

//route for full data 
router.get("full/:id", async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query(
    "SELECT * FROM property WHERE propzip LIKE $1",
    [`${id}%`]
  );
  res.json(rows);
});


//route for zips only
router.get("/partial/:id", async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query(
    "SELECT DISTINCT propzip FROM property WHERE propzip LIKE $1",
    [`${id}%`]
  );
  res.json(rows);
});

// export our router to be mounted by the parent application
module.exports = router;
