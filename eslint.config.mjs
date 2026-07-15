import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import react from "eslint-plugin-react";

export default defineConfig([
  { ignores: [".output/**", ".wxt/**", "node_modules/**"] },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.webextensions },
    },
    rules: {
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-useless-escape": "off",
    },
  },
  {
    files: ["**/*.jsx"],
    extends: [react.configs.flat.recommended],
    settings: { react: { version: "detect" } },
  },
]);
