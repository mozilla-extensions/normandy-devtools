/* eslint-env node */
import crypto from "crypto";

Object.defineProperty(global.self, "crypto", {
  value: {
    getRandomValues: (arr) => crypto.randomBytes(arr.length),
  },
});

browser.experiments.normandy = {
  checkRecipeFilter: () => null,
  runRecipe: () => null,
};

browser.identity = {
  getRedirectURL: () => {},
  launchWebAuthFlow: () => {
    return "https://08e23a90be40fa842a9f18ac049d45a7c3c8e7ec.extensions.allizom.org/#access_token=abc&scope=openid%20profile%20email&expires_in=7200&token_type=Bearer&state=abc&id_token=abc";
  },
};

global.document.body.createTextRange = () => ({
  setEnd: () => {},
  setStart: () => {},
  getBoundingClientRect: () => {},
  getClientRects: () => [],
});
