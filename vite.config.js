import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import dotenv from 'dotenv'

dotenv.config()

const process = require('node:process')

export default defineConfig(({ mode }) => {
  // Load environment variables based on the mode
  const env = loadEnv(mode, process.cwd())

  // Access the environment variable
  const port = (env.VITE_ENVIRONMENT = 'development'
    ? Number.parseInt(env.VITE_PORT || '3000', 10)
    : undefined)

  return {
    plugins: [
      react(),
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: 'learncraft-spanish',
        project: 'learncraft-spanish-frontend',
      }),
    ],
    build: {
      outDir: 'build',
      sourcemap: true, // Enable source maps
    },
    server: {
      port,
      open: true,
    },
  }
})
