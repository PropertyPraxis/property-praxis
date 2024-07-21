const Sentry = require("@sentry/node")
const { ProfilingIntegration } = require("@sentry/profiling-node")

Sentry.init({
  dsn: "https://66094b96912bcb73c3fcfa41b394e9bb@o4506586694025216.ingest.sentry.io/4506565004754944",
  environment: process.env.NODE_ENV,
  integrations: [new ProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
})
