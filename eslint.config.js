import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import unicornPlugin from 'eslint-plugin-unicorn';
import sonarjsPlugin from 'eslint-plugin-sonarjs';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: '@typescript-eslint/parser',
      globals: {
        window: 'readonly',
        document: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
      '@typescript-eslint': typescriptPlugin,
      unicorn: unicornPlugin,
      sonarjs: sonarjsPlugin,
    },
    rules: {
      ...prettierConfig.rules, // Prettier rules
      'prettier/prettier': 'error',

      // React-specific rules
      'react/react-in-jsx-scope': 'off', // For React 17+
      'react/prop-types': 'off', // Disable if using TypeScript

      // Import rules
      'import/no-unresolved': 'error',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],

      // Accessibility
      'jsx-a11y/anchor-is-valid': 'off',

      // TypeScript rules
      ...typescriptPlugin.configs.recommended.rules,

      // Unicorn rules (opinionated)
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: ['^index\\.(js|jsx|ts|tsx)$'],
        },
      ],
      'unicorn/no-null': 'off', // Allow nulls if needed

      // SonarJS rules (code quality)
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-collapsible-if': 'warn',

      // Additional opinionated rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'arrow-body-style': ['warn', 'as-needed'],
      'prefer-template': 'warn',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect the React version
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
];
