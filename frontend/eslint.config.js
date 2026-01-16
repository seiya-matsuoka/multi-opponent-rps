import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';

export default [
  { ignores: ['node_modules/**', 'dist/**', 'coverage/**', '**/generated/**'] },

  // JS推奨
  js.configs.recommended,

  // TS推奨（flat config）
  ...tseslint.configs.recommended,

  // React Hooks / React Refresh（Vite向け）
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Hooks推奨ルール
      ...reactHooks.configs.recommended.rules,

      // exportの扱い
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  // .d.ts（型宣言ファイル）は宣言すること自体が目的であり、no-unused-vars で未使用扱いされても問題ないためOFFにする
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  // Prettierと競合する整形系ルールは無効化
  prettierConfig,
];
