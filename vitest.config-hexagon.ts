import type { ConfigEnv } from 'vite';
import { mergeConfig } from 'vite';
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
        setupFiles: './src/hexagon/testing/setupTests.ts',
        include: ['**/hexagon/**/*.{test,spec}.{js,ts,jsx,tsx}'],
        exclude: ['**/.stryker-tmp/**', '**/node_modules/**'],
        mockReset: true,
        clearMocks: true,
        restoreMocks: true,
        testTimeout: 5000,
        coverage: {
          include: ['**/hexagon/**'],
          exclude: [
            '**/hexagon/testing/**',
            '**/hexagon/config/**',
            '**/hexagon/infrastructure/**',
            '**/*{.,-}{test,spec,bench,benchmark}?(-d).?(c|m)[jt]s?(x)',
            '**/{index,types}?(-d).?(c|m)[jt]s?(x)',
            '**/[.]**',
            '**/components/**',
            '**/.stryker-tmp/**',
            '**/node_modules/**',
            '**/assets/**',
            '**/tests/**',
            '**/mocks/**',
            '**/providers/**',
            '**/types/**',
            '**/METRICS/**',
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
