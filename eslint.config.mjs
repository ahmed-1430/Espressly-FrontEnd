import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

/**
 * Lint configuration.
 *
 * `scripts/` holds one-off Node asset pipelines that predate the app and run on
 * CommonJS, so they are excluded rather than rewritten.
 */
export default tseslint.config(
  {
    ignores: [".next/**", "node_modules/**", "scripts/**", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
);