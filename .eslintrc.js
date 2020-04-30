module.exports = {
  env: {
    jest: true,
    webextensions: true,
  },
  parser: "babel-eslint",
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:mozilla/recommended",
    "plugin:react/recommended",
  ],
  plugins: ["mozilla"],
  rules: {
    "mozilla/no-define-cc-etc": "off",
    "react/jsx-curly-brace-presence": ["error", "never"],
    "react/jsx-sort-props": [
      "error",
      {
        callbacksLast: true,
        shorthandFirst: true,
        ignoreCase: true,
        reservedFirst: true,
      },
    ],
    eqeqeq: ["error", "always"],
    "prefer-const": "error",
    "lines-between-class-members": ["error", "always"],
    "padding-line-between-statements": [
      "error",
      {
        blankLine: "always",
        prev: "multiline-block-like",
        next: "*",
      },
    ],
  },

  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      plugins: ["mozilla", "@typescript-eslint"],
      extends: [
        "eslint:recommended",
        "plugin:prettier/recommended",
        "plugin:mozilla/recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier/@typescript-eslint",
      ],
    },
  ],
};
