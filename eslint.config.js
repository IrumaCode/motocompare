import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['**/dist/', '**/coverage/', '.claude/']),

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

  // Plain JS config files are not part of any tsconfig, so skip type-aware rules there
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Must stay last: turns off rules that would conflict with Prettier formatting
  prettierConfig,
);
