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
  setupFiles: ["<rootDir>/extension/content/tests/jest.setup.js"],
  setupFilesAfterEnv: ["<rootDir>/extension/content/tests/jest-env.setup.js"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^devtools/(.*)$": "<rootDir>/extension/content/$1",
    "\\.(less|css)$": "identity-obj-proxy",
  },
  collectCoverage: false,
  collectCoverageFrom: ["<rootDir>/extension/content/**/*.{js,ts,tsx}"],
};
