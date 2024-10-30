import antfu from '@antfu/eslint-config';
import prettierConfig from 'eslint-config-prettier';

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
      'src/components/Coaching',
      'node_modules/',
      'src/mocks/data/serverlike/actualServerData.json',
      '*.yml',
    ],
  },
  prettierConfig,
);
