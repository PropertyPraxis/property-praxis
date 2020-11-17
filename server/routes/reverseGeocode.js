const Router = require("express-promise-router");
const db = require("../db"); //index.js
const router = new Router();
const queries = require("../utils/queries");

router.get("/", async (req, res) => {
  try {
    const { coordinates = null } = req.query;
    const { data } = await queries.queryMapboxAPI({
      coordinates,
      mbQueryType: queries.REVERSE_GEOCODE,
    });

    res.json(data);
  } catch (err) {
    const msg = `An error occurred executing reverse geocode. Message: ${err}`;
    console.error(msg);
    res.status(404).send(msg);
  }
});
module.exports = router;
