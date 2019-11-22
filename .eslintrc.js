/* eslint-env node */
module.exports = {
  parser: "babel-eslint",
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:mozilla/recommended",
    "plugin:react/recommended",
  ],
  rules: {
    "mozilla/no-define-cc-etc": "off", // seems broken outside of m-c
    "generator-star-spacing": "off",
  },
};
