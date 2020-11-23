const Router = require("express-promise-router");
const router = new Router();
const queries = require("../utils/queries");

router.get("/", async (req, res) => {
  try {
    const { type, year, parpropid } = req.query;
    let clientData;
    if (type === "detailed-record-years") {
      const years = await queries.queryPGDB({
        PGDBQueryType: queries.AVAILABLE_PRAXIS_YEARS,
      });
      const searchYears = years.data.map((record) => record.praxisyear);
      // .filter((pyear) => Number(pyear) !== Number(year)); //filter the current year

      const { data } = await queries.queryPGDB({
        PGDBQueryType: queries.DETAILED_RECORD_YEARS,
        searchYears,
        parpropid,
      });
      clientData = Object.values(data[0]);
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
