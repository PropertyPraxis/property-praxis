const Router = require("express-promise-router");
const db = require("../db"); //index.js
const router = new Router();
const queries = require("../utils/queries");

router.get("/", async (req, res) => {
  try {
    const { type, ownid, code, place, coordinates, year } = req.query;
    let clientData;
    if (["address"].includes(type)) {
      const { data } = await queries.queryMapboxAPI({
        place,
        coordinates,
        mbQueryType: "primary-place",
      });
      clientData = data;
    } else if (["zipcode", "speculator"].includes(type)) {
      const { data } = await queries.queryPGDB({
        PGDBQueryType: `primary-${type}`,
        code,
        ownid,
        coordinates,
        year,
      });
      clientData = data;
    } else {
      clientData = null;
    }

    res.json(clientData);
  } catch (err) {
    const msg = `An error occurred executing primary search query. Message: ${err}`;
    res.status(404).send(msg);
    throw new Error(msg);
  }
});
module.exports = router;
