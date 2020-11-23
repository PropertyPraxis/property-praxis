const Router = require("express-promise-router");
const router = new Router();
const queries = require("../utils/queries");

/* This route covers all requests that 
are not part of the primary or detailed 
search groups. */

router.get("/", async (req, res) => {
  try {
    const { type } = req.query;
    let clientData;
    if (type === "available-praxis-years") {
      const { data } = await queries.queryPGDB({
        PGDBQueryType: queries.AVAILABLE_PRAXIS_YEARS,
      });
      clientData = data;
    } else {
      clientData = null;
    }
    res.json(clientData);
  } catch (err) {
    const msg = `An error occurred executing search search query. Message: ${err}`;
    console.error(msg);
    res.status(500).send(msg);
  }
});

module.exports = router;
