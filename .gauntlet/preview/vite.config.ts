import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const PREVIEW = path.dirname(fileURLToPath(import.meta.url));
const GAUNTLET = path.resolve(PREVIEW, '..');
const REPO = path.resolve(GAUNTLET, '..');

export default defineConfig({
  root: PREVIEW,
  cacheDir: path.resolve(GAUNTLET, '.vite-cache'),
  plugins: [react()],
  resolve: {
    alias: [
      // Never Auth0: throw if anything reaches the real SDK
      {
        find: '@auth0/auth0-react',
        replacement: path.resolve(PREVIEW, 'adapters/auth0Forbidden.ts'),
      },

      // Exact stub swaps MUST precede the '@application' prefix alias
      {
        find: /^@application\/adapters\/authAdapter$/,
        replacement: path.resolve(PREVIEW, 'adapters/authPort.ts'),
      },
      {
        find: /^@application\/queries\/useMyData$/,
        replacement: path.resolve(PREVIEW, 'adapters/myDataQuery.ts'),
      },
      {
        find: /^@application\/adapters\/appUserAdapter$/,
        replacement: path.resolve(PREVIEW, 'adapters/appUserAdapter.ts'),
      },

      { find: 'src', replacement: path.resolve(REPO, 'src') },
      { find: 'mocks', replacement: path.resolve(REPO, 'mocks') },
      { find: 'tests', replacement: path.resolve(REPO, 'tests') },

      {
        find: '@domain',
        replacement: path.resolve(REPO, 'src/hexagon/domain'),
      },
      {
        find: '@application',
        replacement: path.resolve(REPO, 'src/hexagon/application'),
      },
      {
        find: '@infrastructure',
        replacement: path.resolve(REPO, 'src/hexagon/infrastructure'),
      },
      {
        find: '@interface',
        replacement: path.resolve(REPO, 'src/hexagon/interface'),
      },
      {
        find: '@testing',
        replacement: path.resolve(REPO, 'src/hexagon/testing'),
      },
      {
        find: '@composition',
        replacement: path.resolve(REPO, 'src/hexagon/composition'),
      },
      {
        find: '@config',
        replacement: path.resolve(REPO, 'src/hexagon/config'),
      },
    ],
  },
  define: {
    global: 'globalThis',
    'import.meta.env.VITE_BACKEND_DOMAIN': JSON.stringify(
      'http://gauntlet.invalid/',
    ),
    'import.meta.env.VITE_AUTH0_DOMAIN': JSON.stringify('gauntlet.invalid'),
    'import.meta.env.VITE_AUTH0_CLIENTID': JSON.stringify('gauntlet-preview'),
    'import.meta.env.VITE_API_AUDIENCE': JSON.stringify('gauntlet'),
    'import.meta.env.VITE_ENVIRONMENT': JSON.stringify('development'),
    'import.meta.env.VITE_LOCAL_DOMAIN': JSON.stringify(
      'http://localhost:5273/',
    ),
    'import.meta.env.VITE_PORT': JSON.stringify('5273'),
  },
  css: {
    postcss: REPO,
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  server: {
    port: 5273,
    strictPort: true,
    open: false,
    fs: {
      allow: [REPO, GAUNTLET],
    },
  },
});
