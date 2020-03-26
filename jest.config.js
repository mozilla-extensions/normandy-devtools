/* eslint-env node */
module.exports = {
  globals: {
    browser: {
      experiments: {},
      identity: {
        getRedirectURL: () => {},
        launchWebAuthFlow: () => {
          return "https://08e23a90be40fa842a9f18ac049d45a7c3c8e7ec.extensions.allizom.org/#access_token=abc&scope=openid%20profile%20email&expires_in=7200&token_type=Bearer&state=abc&id_token=abc";
        },
      },
    },
  },
  setupFiles: ["<rootDir>/tests/conftests.js"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  moduleNameMapper: {
    "^devtools/(.*)$": "<rootDir>/extension/content/$1",
    "\\.(less|css)$": "identity-obj-proxy",
  },
};
