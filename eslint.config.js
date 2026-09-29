import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import pluginQuery from '@tanstack/eslint-plugin-query';
import prettier from 'eslint-config-prettier/flat';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import playwright from 'eslint-plugin-playwright';
import reactHooks from 'eslint-plugin-react-hooks';
import testingLibrary from 'eslint-plugin-testing-library';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import project from './tools/eslint-plugin-seedteststatic/index.js';

const TESTS = ['**/*.test.{ts,tsx}', 'src/test/**'];

export default defineConfig([
  globalIgnores([
    'dist/',
    'build/',
    'coverage/',
    'playwright-report/',
    'test-results/',
    'src/routeTree.gen.ts',
    '.seed/',
    '.plans/',
  ]),

  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    // Everywhere, configs and E2E included: numbers in template strings are fine (`localhost:${PORT}`).
    rules: { '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }] },
  },
  // Plain JS files (configs, the lint plugin) are not part of a tsconfig project.
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },

  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.strict,

  pluginQuery.configs['flat/recommended'],

  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { seedteststatic: project },
    rules: {
      'seedteststatic/no-literal-jsx-text': 'error',
      'seedteststatic/query-keys-from-factory': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/only-throw-error': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
    },
  },

  // Network calls only in a feature's api/ layer or the shared HTTP client.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/features/*/api/**', 'src/shared/lib/http/**', ...TESTS],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'Network calls live in a feature api/ layer or shared/lib/http.',
        },
      ],
    },
  },

  // Configuration only through the validated env module.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/shared/config/env.ts', ...TESTS],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message: 'Read configuration from @/shared/config/env — it is validated and typed.',
        },
      ],
      // import.meta.env.X is forbidden, except the build-mode flags DEV / PROD / MODE (devtools gating).
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[object.object.type='MetaProperty'][object.property.name='env']:not([property.name=/^(DEV|PROD|MODE)$/])",
          message: 'Read configuration from @/shared/config/env — it is validated and typed.',
        },
        {
          selector:
            ":not(MemberExpression) > MemberExpression[object.type='MetaProperty'][property.name='env']",
          message: 'Read configuration from @/shared/config/env — it is validated and typed.',
        },
      ],
    },
  },

  // Tests: Vitest + Testing Library; user-visible text is allowed in assertions and fixtures.
  {
    files: TESTS,
    extends: [vitest.configs.recommended, testingLibrary.configs['flat/react']],
    rules: { 'seedteststatic/no-literal-jsx-text': 'off' },
  },
  // Vitest runs without globals, so Testing Library cannot register its own cleanup: setup.ts does it.
  { files: ['src/test/setup.ts'], rules: { 'testing-library/no-manual-cleanup': 'off' } },
  { files: ['e2e/**/*.ts'], extends: [playwright.configs['flat/recommended']] },
  // CloudFront Functions are classic scripts whose runtime calls the top-level `handler`.
  { files: ['deploy/cloudfront/*.js'], languageOptions: { sourceType: 'script', globals: {} } },

  prettier, // last: turns off every rule Prettier owns
]);
