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
    files: ['**/*.{ts,tsx}'],
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
        {
          type: 'domain',
          mode: 'folder',
          pattern: 'src/hexagon/domain/**/*.{ts,tsx}',
        },
        {
          type: 'ports',
          mode: 'folder',
          pattern: 'src/hexagon/application/ports/**/*.{ts,tsx}',
        },
        {
          type: 'adapters',
          mode: 'folder',
          pattern: 'src/hexagon/application/adapters/**/*.{ts,tsx}',
        },
        {
          type: 'coordinators',
          mode: 'folder',
          pattern: 'src/hexagon/application/coordinators/**/*.{ts,tsx}',
        },
        {
          type: 'application',
          mode: 'folder',
          pattern: [
            'src/hexagon/application/implementations/**/*.{ts,tsx}',
            'src/hexagon/application/queries/**/*.{ts,tsx}',
            'src/hexagon/application/types/**/*.{ts,tsx}',
            'src/hexagon/application/units/**/*.{ts,tsx}',
            'src/hexagon/application/useCases/**/*.{ts,tsx}',
            'src/hexagon/application/utils/**/*.{ts,tsx}',
            'src/hexagon/application/**/*.{ts,tsx}',
          ],
        },
        {
          type: 'infrastructure',
          mode: 'folder',
          pattern: 'src/hexagon/infrastructure/**/*.{ts,tsx}',
        },
        {
          type: 'interface',
          mode: 'folder',
          pattern: 'src/hexagon/interface/**/*.{ts,tsx}',
        },
        {
          type: 'composition',
          mode: 'folder',
          pattern: 'src/hexagon/composition/**/*.{ts,tsx}',
        },
        {
          type: 'testing',
          mode: 'folder',
          pattern: 'src/hexagon/testing/**/*.{ts,tsx}',
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
        // TO DO: INCREASE THIS TO ERROR (Lower priority)
        'error',
        {
          patterns: [
            {
              group: [
                '../**/*',
                './**/*',
                // Exclude stylesheets
                '!./**/*.css',
                '!./**/*.scss',
                // However, deep relative imports are still not allowed
              ],
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
        // TO DO: INCREASE THIS TO ERROR (HIGH PRIORITY)
        'warn',
        {
          default: 'allow',
          rules: [
            {
              from: ['domain'],
              disallow: [
                'application',
                'ports',
                'adapters',
                'coordinators',
                'infrastructure',
                'interface',
                'composition',
              ],
              message: 'domain must not depend on any other layers.',
            },
            {
              from: ['ports'],
              disallow: [
                'application',
                'infrastructure',
                'interface',
                'composition',
                'coordinators',
                'adapters',
              ],
              message:
                'ports must not depend on any other layers except for domain.',
            },
            {
              from: ['adapters'],
              disallow: [
                'application',
                'interface',
                'composition',
                'coordinators',
              ],
              message:
                'adapters must not depend on any other layers except for domain, ports, and infrastructure.',
            },
            {
              from: ['application'],
              disallow: ['infrastructure', 'interface', 'composition'],
              message:
                'application must not depend on any other layers except for ports, adapters, coordinators, and domain.',
            },
            {
              from: ['coordinators'],
              disallow: [
                'application',
                'infrastructure',
                'interface',
                'ports',
                'adapters',
              ],
              message:
                'coordinators must not depend on application/infrastructure/interface/ports/adapters.',
            },
            {
              from: ['infrastructure'],
              disallow: [
                'application',
                'interface',
                'composition',
                'coordinators',
                'adapters',
              ],
              message:
                'infrastructure must not depend on application/interface/composition/coordinators/adapters.',
            },
            {
              from: ['interface'],
              disallow: ['infrastructure', 'composition'],
              message:
                'interface must not depend directly on infrastructure (should use one application hook only).',
            },
          ],
        },
      ],
    },
  },

  prettierConfig,
);
