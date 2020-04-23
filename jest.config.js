/* eslint-env node */
module.exports = {
  globals: {
    browser: {
      experiments: {},
      identity: {},
    },
  },
  setupFiles: ["<rootDir>/tests/conftests.js"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^devtools/(.*)$": "<rootDir>/extension/content/$1",
    "\\.(less|css)$": "identity-obj-proxy",
  },
};
