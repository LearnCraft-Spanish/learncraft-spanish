import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  typescript: true,
  // Customization
  files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
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
  // Ignore specific files
  // Not to be used without a good reason
  ignorePatterns: [
    'src/mocks/data/serverlike/actualServerData.json', // Huge Data, ignored by git
  ],
  overrides: [
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
  ],
})
