const express = require("express")
const morgan = require("morgan")
const helmet = require("helmet")
const cors = require("cors")
const mountRoutes = require("./routes")
const Sentry = require("@sentry/node")

const app = express()

Sentry.init({
  dsn: "https://66094b96912bcb73c3fcfa41b394e9bb@o4506586694025216.ingest.sentry.io/4506565004754944",
  environment: process.env.ENVIRONMENT,
})

app.use(Sentry.Handlers.requestHandler())

//cors
app.use(cors())

//general security
app.use(helmet())
app.disable("X-powered-by")

//logging
app.use(morgan("combined"))

//mount routes
mountRoutes(app)

app.listen(5000, () => {
  console.log("Listening on port 5000...")
})
