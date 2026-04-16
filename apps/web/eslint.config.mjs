import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "codegen.js",
    "next-env.d.ts",
    "eslint.config.mjs",
    "postcss.config.mjs",
    "scripts/**/*.mjs",
  ]),
];

export default eslintConfig;
