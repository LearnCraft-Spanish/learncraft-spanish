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
        testTimeout: 10000,
        coverage: {
          include: ['**/hexagon/**'],
          exclude: [
            '**/hexagon/testing/**',
            '**/hexagon/infrastructure/**',
            '**/hexagon/composition/**',
            '**/*{.,-}{test,spec,bench,benchmark}?(-d).?(c|m)[jt]s?(x)',
            '**/src/hexagon/**/{index,types}?(-d).?(c|m)[jt]s?(x)',
            '**/testing/**',
            '**/application/ports/**',
            '**/application/types/**',
            '**/constants.ts',
            '**/*.constants.{ts,tsx}',
            '**/*.mock.{ts,tsx}',
            '**/*.stub.{ts,tsx}',
            '**/*.types.{ts,tsx}',
            '**/src/hexagon/**/[.]**',
            '**/src/hexagon/**/{test,tests}/**',
            '**/node_modules/**',
            '**/.stryker-tmp/**',
            '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
          ],
        },
      },
    }),
  ),
);
