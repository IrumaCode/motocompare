import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['**/dist/', '**/coverage/', '**/generated/', '.claude/']),

  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        // Each file is type-checked with the nearest tsconfig.json (api/ or web/)
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // React app: rules of hooks, and only components exported from .tsx (keeps Fast Refresh working)
  {
    files: ['web/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
  },

  // Test helpers are never hot-reloaded, so Fast Refresh's "only export components" rule
  // does not apply to them (render.tsx exports a render function)
  {
    files: ['web/src/test/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },

  // Plain JS config files are not part of any tsconfig, so skip type-aware rules there
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Must stay last: turns off rules that would conflict with Prettier formatting
  prettierConfig,
);
