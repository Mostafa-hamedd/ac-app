// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

const FEATURES = [
  'auth',
  'dashboard',
  'vehicles',
  'requests',
  'payments',
  'notifications',
  'profile',
];

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', '.expo/*', 'android/*', 'ios/*', 'coverage/*', 'expo-env.d.ts'],
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Architecture rule #2: features are consumed only through their public index.ts.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: FEATURES.map((name) => `@/features/${name}/*`),
              message:
                "Import from the feature's public API (e.g. '@/features/requests'), not its internal files.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['warn', { fixStyle: 'inline-type-imports' }],
    },
  },
  {
    // Architecture rule #5: shared code and platform services never depend on features.
    files: ['src/shared/**', 'src/lib/**', 'src/theme/**', 'src/config/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features', '@/features/*', '@/app', '@/app/*'],
              message: 'shared/, lib/, theme/ and config/ must not import features or routes.',
            },
          ],
        },
      ],
    },
  },
  {
    // Styles come from the design tokens (src/theme/tokens.js), never one-off values.
    files: ['src/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/#[0-9a-fA-F]{6}\\b/]',
          message: 'Use a color token from src/theme/tokens.js instead of a hex color.',
        },
        {
          selector: 'Literal[value=/\\[-?[0-9.]+px\\]/]',
          message: 'Use the Tailwind scale or add a token to src/theme/tokens.js.',
        },
      ],
    },
  },
  {
    // jest.mock factories run before imports, so they have to use require().
    files: ['jest.setup.ts', '**/*.test.ts', '**/*.test.tsx'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['*.config.js', 'src/theme/tokens.js'],
    languageOptions: { sourceType: 'commonjs' },
  },
]);
