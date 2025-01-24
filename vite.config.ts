// vite.config.ts
import process from 'node:process';
import path from 'node:path';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { defineConfig, loadEnv } from 'vite';

dotenv.config();

export default defineConfig(({ mode }) => {
  // Load environment variables based on the mode
  const env = loadEnv(mode, process.cwd());

  // Access the environment variable with proper typing
  const port =
    env.VITE_ENVIRONMENT === 'development'
      ? Number.parseInt(env.VITE_PORT || '3000', 10)
      : undefined;

  return {
    environment: 'jsdom',
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
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src'),
        mocks: path.resolve(__dirname, './mocks'),
        tests: path.resolve(__dirname, './tests'),
      },
    },
    server: {
      port,
      open: true,
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  };
});
