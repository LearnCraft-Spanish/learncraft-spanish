import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptParser, // Use this if using TypeScript
      // parser: 'espree', // Use this if not using TypeScript
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
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
        },
      ],

      // Accessibility
      'jsx-a11y/anchor-is-valid': 'off',

      // TypeScript rules
      ...typescriptPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn', // Change this to 'warn' to reduce the severity

      // Additional rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'arrow-body-style': ['warn', 'as-needed'],
      'prefer-template': 'warn',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
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
