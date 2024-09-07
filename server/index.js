require("./instrument")

const express = require("express")
const morgan = require("morgan")
const helmet = require("helmet")
const cors = require("cors")
const mountRoutes = require("./routes")
// const Sentry = require("@sentry/node")

const app = express()

//cors
app.use(cors())

//general security
app.use(helmet())
app.disable("X-powered-by")

//logging
app.use(morgan("combined"))

//mount routes
mountRoutes(app)

// TODO:
// Sentry.setupExpressErrorHandler(app)

app.listen(5000, () => {
  console.log("Listening on port 5000...")
})
