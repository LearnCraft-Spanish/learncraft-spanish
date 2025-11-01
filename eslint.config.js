import antfu from '@antfu/eslint-config';
import prettierConfig from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';

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
    plugins: {
      boundaries,
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
  {
    files: [
      '**/*.mock.ts',
      '**/*.mock.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
      'src/hexagon/testing/setupTests.ts',
    ],
    rules: {
      'react-hooks-extra/no-unnecessary-use-prefix': 'off',
    },
  },
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

  // TypeScript-specific rules
  {
    files: ['**/*.ts'],
    rules: {
      // Prefer TS type-only imports where possible
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
    },
  },
  // Boundaries plugin configuration
  {
    files: ['src/hexagon/**/*.{ts,tsx}'],
    settings: {
      'boundaries/elements': [
        { type: 'domain', mode: 'folder', pattern: 'src/hexagon/domain/**' },
        {
          type: 'application',
          mode: 'folder',
          pattern: 'src/hexagon/application/**',
        },
        {
          type: 'infrastructure',
          mode: 'folder',
          pattern: 'src/hexagon/infrastructure/**',
        },
        {
          type: 'interface',
          mode: 'folder',
          pattern: 'src/hexagon/interface/**',
        },
        {
          type: 'composition',
          mode: 'folder',
          pattern: 'src/hexagon/composition/**',
        },
      ],
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // Ban all relative imports in hexagon; require aliases (@domain/* etc.)
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../**', './**', '.*/**'],
              message:
                'Use aliased imports (e.g., @domain/*) instead of relative paths.',
            },
            {
              group: ['src/hexagon/**'],
              message:
                'Use aliased imports (@domain/*, @application/*, etc.) instead of src/hexagon/* paths.',
            },
          ],
        },
      ],
      'boundaries/element-types': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: ['domain'],
              disallow: [
                'application',
                'infrastructure',
                'interface',
                'composition',
              ],
              message:
                'domain must not depend on application/infrastructure/interface/composition.',
            },
            {
              from: ['application'],
              disallow: ['infrastructure', 'interface', 'composition'],
              message:
                'application must not depend on infrastructure/interface/composition.',
            },
            {
              from: ['interface'],
              disallow: ['domain', 'infrastructure'],
              message:
                'interface must not depend on domain/infrastructure (should use application/use-cases only).',
            },
            {
              from: ['composition'],
              disallow: ['domain', 'application', 'infrastructure'],
              message:
                'composition must not depend on domain/application/infrastructure (should use interface only).',
            },
          ],
        },
      ],
    },
  },

  prettierConfig,
);
