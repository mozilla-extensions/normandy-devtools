// @ts-nocheck
/* eslint-env node */
import crypto from "crypto";

import { render } from "@testing-library/react";
import { createMemoryHistory } from "history";
import PropTypes from "prop-types";
import React from "react";
import { Router, Route } from "react-router-dom";

import { EnvironmentProvider } from "devtools/contexts/environment";

Object.defineProperty(global.self, "crypto", {
  value: {
    getRandomValues: (arr) => crypto.randomBytes(arr.length),
  },
});

browser.experiments.normandy = {
  checkRecipeFilter: jest.fn(),
  runRecipe: jest.fn(),
  /** type (recipe: unknown): Array<string> */
  // eslint-disable-next-line no-unused-vars
  getRecipeSuitabilities: jest.fn((_recipe) =>
    Promise.resolve(["RECIPE_SUITABILITY_FILTER_MATCH"]),
  ),
  bucketSample: jest.fn(
    // eslint-disable-next-line no-unused-vars
    (_start, _count, _total, _inputs) => new Promise(() => {}),
  ), // it never resolves by default
};

browser.experiments.networking = {
  pruneAllConnections: () => {},
};

browser.networkStatus.onConnectionChanged = {
  // eslint-disable-next-line no-unused-vars
  addListener: (_) => {},
  // eslint-disable-next-line no-unused-vars
  removeListener: (_) => {},
};

browser.identity = {
  getRedirectURL: () => "",
  // eslint-disable-next-line no-unused-vars
  launchWebAuthFlow: (_) => {
    return "https://08e23a90be40fa842a9f18ac049d45a7c3c8e7ec.extensions.allizom.org/#access_token=abc&scope=openid%20profile%20email&expires_in=7200&token_type=Bearer&state=abc&id_token=abc";
  },
};

global.document.body.createTextRange = () => ({
  setEnd: () => {},
  setStart: () => {},
  getBoundingClientRect: () => {},
  getClientRects: () => [],
});

// Workaround for https://github.com/jsdom/jsdom/issues/3002
global.document.createRange = () => {
  const range = new Range();

  range.getBoundingClientRect = jest.fn();

  range.getClientRects = () => {
    return {
      item: () => null,
      length: 0,
      [Symbol.iterator]: jest.fn(),
    };
  };

  return range;
};

global.renderWithContext = (
  ui,
  {
    route = "/",
    path = "/",
    history = createMemoryHistory({ initialEntries: [route] }),
  } = {},
) => {
  const Wrapper = ({ children }) => (
    <Router history={history}>
      <EnvironmentProvider>
        <Route path={path}>{children}</Route>
      </EnvironmentProvider>
    </Router>
  );

  Wrapper.propTypes = {
    children: PropTypes.object,
  };
  return {
    ...render(ui, { wrapper: Wrapper }),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history,
  };
};
