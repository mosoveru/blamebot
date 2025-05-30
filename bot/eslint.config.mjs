import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import { defineConfig } from 'eslint/config';
import sonarjs from 'eslint-plugin-sonarjs';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.recommended,
  sonarjs.configs.recommended,
  eslintPluginPrettier,
]);
