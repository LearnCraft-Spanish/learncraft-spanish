import antfu from '@antfu/eslint-config';

export default antfu(
  {
    react: true,
    typescript: true,
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
      'max-len': ['warn', { code: 100, ignoreStrings: true }],
    },
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
      'node_modules/',
      'src/mocks/data/serverlike/actualServerData.json',
      '*.yml',
    ],
  },
  {
    // Add Prettier last to disable conflicting ESLint formatting rules
    "extends": [
      "@antfu",
      "plugin:prettier/recommended" // Ensures Prettier takes over formatting
    ]
  }
);
