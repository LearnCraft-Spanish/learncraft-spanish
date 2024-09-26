// eslint.config.js
import antfu from '@antfu/eslint-config'
import vitestPlugin from 'eslint-plugin-vitest'

export default antfu(
  {
    react: true,
    typescript: true,
  },
  // Testing Customization
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: { vitest: vitestPlugin },
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
    },
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
)
