// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu(
  // Primary configuration
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      globals: {
        // Add Vitest globals
        describe: true,
        it: true,
        expect: true,
        vi: true,
      },
    },
    rules: {
      // Add any custom rules here
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
