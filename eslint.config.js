import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['dist/**', 'release/**', 'node_modules/**', '.vite/**', 'public/**'],
  },

  {
    files: ['**/*.{js,ts,vue}'],
    extends: [js.configs.recommended],
  },

  {
    files: ['**/*.{ts,vue}'],
    extends: [tseslint.configs.recommended],
  },

  {
    files: ['**/*.vue'],
    extends: [pluginVue.configs['flat/recommended']],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
      },
    },
  },

  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        chrome: 'readonly',
      },
    },
  },

  {
    files: ['src/background/**'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },

  {
    files: ['*.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  {
    files: ['**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  {
    files: ['**/*.{ts,vue}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  prettier,
);
