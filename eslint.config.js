import js from '@eslint/js';
import globals from 'globals';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['node_modules/**', 'dist/**', '.astro/**', 'data/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,astro}'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['public/**/*.js', '**/*.astro/*.js'],
    languageOptions: { globals: globals.browser },
  },
  ...astro.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: { ecmaFeatures: { globalReturn: true } },
    },
  },
  prettier,
];
