const Router = require("express-promise-router")
const router = new Router()

router.get("/", async (req, res) => {
  res.status(200).send("OK")
})

module.exports = router
