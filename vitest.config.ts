import { mergeConfig } from 'vite';
import type { ConfigEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig((configEnv: ConfigEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        silent: true,
        globals: true,
        environment: 'jsdom',
        setupFiles: './tests/setupTests',
        include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
        exclude: [
          '**/node_modules/**',
          '**/mocks/**',
          'Coaching.jsx',
          '**/functions/**',
          'useAuth.ts',
        ],
        mockReset: true,
        clearMocks: true,
        restoreMocks: true,
        coverage: {
          exclude: [
            '**/node_modules/**',
            '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
            '**/[.]**',
            'test?(s)/**',
            'test?(-*).?(c|m)[jt]s?(x)',
            '**/*{.,-}{test,spec,bench,benchmark}?(-d).?(c|m)[jt]s?(x)',
            '**/mocks/**',
            '**/Coaching.jsx',
            '**/functions/**',
            '**/useAuth.ts',
            '**/interfaceDefinitions.tsx',
            '**/vite-env.d.ts',
            '**/react-app-env.d.ts',
            '**/Coaching/old/**',
            '**/Coaching/*.js',
            '**/assets/**',
          ],
        },
      },
    }),
  ),
);
