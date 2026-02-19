import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default [
  { ignores: ["dist/**", "node_modules/**"] },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir,
        project: ["./tsconfig.json", "./tsconfig.test.json"],
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
