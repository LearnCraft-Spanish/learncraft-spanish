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
    alias: {
      src: path.resolve(REPO, 'src'),
      mocks: path.resolve(REPO, 'mocks'),
      tests: path.resolve(REPO, 'tests'),

      '@domain': path.resolve(REPO, 'src/hexagon/domain'),
      '@application': path.resolve(REPO, 'src/hexagon/application'),
      '@infrastructure': path.resolve(REPO, 'src/hexagon/infrastructure'),
      '@interface': path.resolve(REPO, 'src/hexagon/interface'),
      '@testing': path.resolve(REPO, 'src/hexagon/testing'),
      '@composition': path.resolve(REPO, 'src/hexagon/composition'),
      '@config': path.resolve(REPO, 'src/hexagon/config'),

      // Auth0-free / network-free adapter swaps (exact module ids used by app code)
      '@application/adapters/authAdapter': path.resolve(
        PREVIEW,
        'adapters/authPort.ts',
      ),
      '@application/adapters/featureFlagAdapter': path.resolve(
        PREVIEW,
        'adapters/featureFlagPort.ts',
      ),
    },
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
    'import.meta.env.VITE_UI_FLAGS': JSON.stringify('ui.student.help.v2'),
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
