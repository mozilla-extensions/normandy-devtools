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
  plugins: [
    "mozilla",
  ],
  rules: {
    "mozilla/no-define-cc-etc": "off",
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
};
