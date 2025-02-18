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
          '**/.stryker-tmp/**',
          'useAuth.ts',
        ],
        mockReset: true,
        clearMocks: true,
        restoreMocks: true,
        testTimeout: 10000,
        coverage: {
          exclude: [
            '**/*{.,-}{test,spec,bench,benchmark}?(-d).?(c|m)[jt]s?(x)',
            '**/[.]**',
            '**/.stryker-tmp/**',
            '**/node_modules/**',
            '**/assets/**',
            '**/functions/**',
            '**/tests/**',
            '**/mocks/**',
            '**/providers/**',
            '**/types/**',
            '**/src/index.tsx',
            '**/react-app-env.d.ts',
            '**/test?(-*).?(c|m)[jt]s?(x)',
            '**/test?(s)/**',
            '**/useAuth.ts',
            '**/vite-env.d.ts',
            '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
          ],
        },
      },
    }),
  ),
);
