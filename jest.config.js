/* eslint-env node */
module.exports = {
  globals: {
    __BUILD__: false,
    __ENV__: "extension",
    __TESTING__: true,
    DEVELOPMENT: false,
    browser: {
      experiments: {},
      identity: {},
      networkStatus: {},
    },
  },
  setupFiles: ["<rootDir>/content/tests/jest.setup.js"],
  setupFilesAfterEnv: ["<rootDir>/content/tests/jest-env.setup.js"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^devtools/(.*)$": "<rootDir>/content/$1",
    "\\.(less|css)$": "identity-obj-proxy",
  },
  collectCoverage: false,
  collectCoverageFrom: ["<rootDir>/content/**/*.{js,ts,tsx}"],
};
