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
    "\\.(less|css)$": "identity-obj-proxy",
    // Anything in devtools, but not files that end in `.less` or `.css`
    "^devtools/(.*)(?<!\\.less|\\.css)$": "<rootDir>/content/$1",
  },
  collectCoverage: false,
  collectCoverageFrom: ["<rootDir>/content/**/*\\.{js,ts,tsx}(?<!\\.d\\.ts)"],
  coverageReporters: ["html-spa", "json", "text-summary"],
};
