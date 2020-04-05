const Router = require("express-promise-router");
const db = require("../db"); //index.js
const router = new Router();

router.get("/", async (req, res) => {
  try {
    const query = "SELECT DISTINCT praxisyear FROM year;";
    const { rows } = await db.templateQuery(query);

    res.json(rows);
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
