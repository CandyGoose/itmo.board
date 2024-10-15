const js = require('@eslint/js');
const node = require('eslint-plugin-node');
const typescriptParser = require('@typescript-eslint/parser');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const globals = require('globals');

module.exports = [
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 12,
      sourceType: 'module',
      globals: {
        ...globals.node,
      }
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      node,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      'no-console': 'off',
      'prefer-const': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-async-promise-executor': 'warn',
      'node/no-unpublished-require': 'off',
    },
  },
  js.configs.recommended,
];
