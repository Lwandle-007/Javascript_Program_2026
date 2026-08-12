import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: "error",
      "no-unused-vars": "warn",
      camelcase: ["error", { properties: "always" }],
    },
  },
];
