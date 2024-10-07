import antfu from '@antfu/eslint-config'

export default antfu(
  {
    react: true,
    typescript: true,
    // Global settings here
    languageOptions: {
      globals: {
        // Add Vitest globals
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
      'max-len': ['warn', { code: 80, ignoreStrings: true }],
    },
  },
  // Customization for different files and overrides
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'], // Move files here
  },
  // Specific configuration for test files
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
      'src/Coaching.jsx',
      '*/data/serverlike/*.json',
      '*.yml',
    ],
  },
)
