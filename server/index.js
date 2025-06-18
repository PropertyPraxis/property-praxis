require("./instrument")

const express = require("express")
const morgan = require("morgan")
const helmet = require("helmet")
const cors = require("cors")
const mountRoutes = require("./routes")
const serverlessHttp = require("serverless-http")
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

// exports.handler = serverlessExpress({ app })
exports.handler = serverlessHttp(app)

// Development server - only run if not in Lambda environment
if (require.main === module || process.env.NODE_ENV === "development") {
  const port = process.env.PORT || 5000
  app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
  })
}
