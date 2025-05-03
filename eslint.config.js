import antfu from '@antfu/eslint-config';
import prettierConfig from 'eslint-config-prettier';

// Import our custom rules
import customRules from './eslint-rules/index.js';

export default antfu(
  {
    react: true,
    typescript: true,
    stylistic: false,
    languageOptions: {
      globals: {
        describe: true,
        it: true,
        expect: true,
        vi: true,
        beforeAll: true,
        beforeEach: true,
        afterEach: true,
        afterAll: true,
      },
    },
    rules: {
      'no-console': ['error', { allow: ['error'] }],
    },
    extends: ['eslint-config-prettier'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    ignores: ['**/*.md'],
  },
  {
    files: ['**/*.test.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        describe: true,
        it: true,
        expect: true,
        vi: true,
      },
    },
  },
  {
    ignores: [
      'pnpm-lock.yaml',
      'src/components/Coaching/old/**',
      'node_modules/',
      '**/mocks/data/**/*.js',
      '*.yml',
      '**/*.md',
    ],
  },
  prettierConfig,
  // Add our custom hexagonal testing rules
  {
    files: [
      'src/hexagon/**/*.test.ts',
      'src/hexagon/**/*.mock.ts',
      'src/hexagon/**/*mock.ts',
      'src/hexagon/**/adapters/*Adapter.mock.ts',
    ],
    ...customRules,
    rules: {
      'custom/no-untyped-mocks': 'error',
    },
  },
);
