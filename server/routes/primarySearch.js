const Router = require("express-promise-router");
const db = require("../db"); //index.js
const router = new Router();
const queries = require("../utils/queries");

router.get("/", async (req, res) => {
  try {
    const { type, ownid, code, place, coordinates, year } = req.query;
    let clientData;

    if (type === "address") {
      // TODO: Query internal address list?
      const { data } = await queries.queryMapboxAPI({
        place,
        coordinates,
        mbQueryType: queries.GEOCODE,
      });
      clientData = data;
    } else if (type === "speculator") {
      const { data } = await queries.queryPGDB({
        PGDBQueryType: queries.PRIMARY_SPECULATOR,
        ownid,
        year,
      });
      clientData = data;
    } else if (type === "zipcode") {
      const { data } = await queries.queryPGDB({
        PGDBQueryType: queries.PRIMARY_ZIPCODE,
        code,
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
    console.error(msg);
    res.status(500).send(msg);
  }
});

module.exports = router;
