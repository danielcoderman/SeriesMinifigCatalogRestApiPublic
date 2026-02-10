import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { 
    languageOptions: { 
      globals: {...globals.browser, ...globals.node, ...globals.jest} // "globals.jest" adds Jest globals
    }
  },
  pluginJs.configs.recommended,
  {
    files: ['src/migrations/*.cjs', 'src/seeders/*.cjs'], // Specific to migrations and seeders
    rules: {
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }]
    }
  },
  {
    files: ['src/index.js'], // Main Express application file
    rules: {
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }]
    }
  }
];