import { defineConfig, splitVendorChunkPlugin } from "vite"
import react from "@vitejs/plugin-react"
import { sentryVitePlugin } from "@sentry/vite-plugin"

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    sentryVitePlugin({
      org: "property-praxis",
      project: "property-praxis",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://api:5000/",
        changeOrigin: true,
      },
    },
  },
})
