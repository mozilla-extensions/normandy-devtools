/* eslint-env node */
module.exports = {
  globals: {
    __BUILD__: false,
    DEVELOPMENT: false,
    browser: {
      experiments: {},
      identity: {},
      networkStatus: {},
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
