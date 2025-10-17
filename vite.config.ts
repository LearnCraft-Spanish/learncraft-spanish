import path from 'node:path';
// vite.config.ts
import process from 'node:process';
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
    env.VITE_ENVIRONMENT === 'development' || env.VITE_ENVIRONMENT === 'staging'
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
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
    },
    define: {
      global: 'globalThis',
    },
    worker: {
      format: 'es',
    },
    build: {
      manifest: true,
      outDir: 'build',
      sourcemap: true,
      rollupOptions: {
        external: [],
        output: {
          globals: {},
        },
      },
    },
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src'),
        mocks: path.resolve(__dirname, './mocks'),
        tests: path.resolve(__dirname, './tests'),

        // Hexagonal architecture layers
        '@domain': path.resolve(__dirname, './src/hexagon/domain'),
        '@application': path.resolve(__dirname, './src/hexagon/application'),
        '@infrastructure': path.resolve(
          __dirname,
          './src/hexagon/infrastructure',
        ),
        '@interface': path.resolve(__dirname, './src/hexagon/interface'),
        '@testing': path.resolve(__dirname, './src/hexagon/testing'),
        '@composition': path.resolve(__dirname, './src/hexagon/composition'),
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
