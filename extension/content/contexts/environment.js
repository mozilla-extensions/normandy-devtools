// @ts-nocheck
import auth0 from "auth0-js";
import PropTypes from "prop-types";
import React from "react";
import { Route, Redirect, Switch, useParams } from "react-router-dom";

import { DEFAULT_ENV, ENVIRONMENTS } from "devtools/config";
import { generateNonce, normalizeErrorObject } from "devtools/utils/auth0";
import ExperimenterAPI from "devtools/utils/experimenterApi";
import NormandyAPI from "devtools/utils/normandyApi";
import { MINUTE, SECOND } from "devtools/utils/timeConstants";

const REFRESH_THRESHOLD_MS = 10 * MINUTE;

const ENV_CONFIG_KEY_RE = /^environment\.([^.]+?)\.config$/;
const AUTH_RESULT_KEY_RE = /^environment\.([^.]+?)\.auth.result$/;
const AUTH_EXPIRES_AT_KEY_RE = /^environment\.([^.]+?)\.auth.expiresAt$/;

const initialEnvironments = ENVIRONMENTS;
const initialAuth = {};

Object.keys(localStorage).forEach((k) => {
  const match = k.match(ENV_CONFIG_KEY_RE);
  if (match) {
    const key = match[1];
    initialEnvironments[key] = JSON.parse(localStorage.getItem(k));
  }
});

Object.keys(initialEnvironments).forEach((k) => {
  initialAuth[k] = {
    result: JSON.parse(localStorage.getItem(`environment.${k}.auth.result`)),
    expiresAt: JSON.parse(
      localStorage.getItem(`environment.${k}.auth.expiresAt`),
    ),
  };
});

const initialState = {
  environments: initialEnvironments,
  auth: initialAuth,
  selectedKey: DEFAULT_ENV,
  isLoggingIn: false,
};
export const environmentContext = React.createContext(initialState);
const { Provider } = environmentContext;

export const ACTION_SELECT_ENVIRONMENT = "SELECT_ENVIRONMENT";
export const ACTION_UPDATE_ENVIRONMENT = "UPDATE_ENVIRONMENT";
export const ACTION_UPDATE_AUTH = "UPDATE_AUTH";
export const ACTION_UPDATE_AUTH_EXPIRES_AT = "UPDATE_AUTH_EXPIRES_AT";
export const ACTION_UPDATE_AUTH_RESULT = "UPDATE_AUTH_RESULT";
export const ACTION_SET_IS_LOGGING_IN = "SET_LOGGING_IN";

function reducer(state, action) {
  switch (action.type) {
    case ACTION_UPDATE_ENVIRONMENT:
      const newConfig = action.config || ENVIRONMENTS[action.key];
      if (newConfig) {
        return {
          ...state,
          environments: {
            ...state.environments,
            [action.key]: newConfig,
          },
          auth: {
            ...state.auth,
            [action.key]: {
              result: null,
              expiresAt: null,
            },
          },
        };
      }

      const { [action.key]: _omitEnv, ...newEnvironments } = state.environments;
      const { [action.key]: _omitAuth, ...newAuth } = state.auth;
      return {
        ...state,
        environments: newEnvironments,
        auth: newAuth,
        selectedKey:
          state.selectedKey === action.key ? DEFAULT_ENV : state.selectedKey,
      };

    case ACTION_UPDATE_AUTH:
      return {
        ...state,
        auth: {
          ...state.auth,
          [action.key]: {
            result: action.result,
            expiresAt: action.expiresAt,
          },
        },
      };

    case ACTION_UPDATE_AUTH_RESULT:
      return {
        ...state,
        auth: {
          ...state.auth,
          [action.key]: {
            ...state.auth[action.key],
            result: action.result,
          },
        },
      };

    case ACTION_UPDATE_AUTH_EXPIRES_AT:
      return {
        ...state,
        auth: {
          ...state.auth,
          [action.key]: {
            ...state.auth[action.key],
            expiresAt: action.expiresAt,
          },
        },
      };

    case ACTION_SELECT_ENVIRONMENT:
      return {
        ...state,
        selectedKey: action.key,
      };

    case ACTION_SET_IS_LOGGING_IN:
      return {
        ...state,
        isLoggingIn: action.isLoggingIn,
      };

    default:
      return state;
  }
}

function EnvironmentSelector({ children }) {
  const { envKey } = useParams();
  const environments = useEnvironments();
  const dispatch = useEnvironmentDispatch();

  const allKeys = Object.keys(environments);
  if (!allKeys.includes(envKey)) {
    return <Redirect to={`/${DEFAULT_ENV}`} />;
  }

  React.useEffect(() => {
    dispatch({
      type: ACTION_SELECT_ENVIRONMENT,
      key: envKey,
    });
  }, [envKey]);

  return children;
}

function EnvironmentRouter({ children }) {
  return (
    <Switch>
      <Route exact path="/">
        <Redirect to={`/${DEFAULT_ENV}`} />
      </Route>
      <Route path="/:envKey">
        <EnvironmentSelector>{children}</EnvironmentSelector>
      </Route>
    </Switch>
  );
}

EnvironmentRouter.propTypes = {
  children: PropTypes.any,
};

export function EnvironmentProvider({ children }) {
  /** @type {[React.ReducerState<any>, React.Dispatch<React.ReducerAction<any>>]} */
  const [state, dispatch] = React.useReducer(reducer, initialState);

  // Add event listener for changes to local storage
  React.useEffect(() => {
    window.addEventListener("storage", (ev) => {
      [
        [ENV_CONFIG_KEY_RE, ACTION_UPDATE_ENVIRONMENT, "config"],
        [AUTH_EXPIRES_AT_KEY_RE, ACTION_UPDATE_AUTH_EXPIRES_AT, "expiresAt"],
        [AUTH_RESULT_KEY_RE, ACTION_UPDATE_AUTH_RESULT, "result"],
      ].forEach(([regex, actionType, valueName]) => {
        const match = ev.key.match(regex);
        if (match) {
          const envKey = match[1];
          dispatch({
            type: actionType,
            key: envKey,
            // @ts-ignore
            [valueName]: JSON.parse(ev.newValue),
          });
        }
      });
    });
  }, []);

  const checkExpiredAuth = () => {
    console.info(`Checking for expired Auth0 tokens...`);
    Object.entries(state.environments).forEach(async ([key, environment]) => {
      const { expiresAt } = state.auth[key];
      if (expiresAt) {
        if (expiresAt - new Date().getTime() <= REFRESH_THRESHOLD_MS) {
          try {
            await refreshToken(dispatch, key, environment);
          } catch (err) {
            console.warn(`Unable to refresh Auth0 access token for "${key}"`);
            console.warn(err);
            logout(dispatch, key);
          }
        }
      } else {
        logout(dispatch, key);
      }
    });
  };

  let refreshInterval;
  React.useEffect(() => {
    // Check for expired auth tokens and set an interval to recheck
    checkExpiredAuth();
    refreshInterval = window.setInterval(
      checkExpiredAuth,
      REFRESH_THRESHOLD_MS,
    );

    // Return a cleanup function
    return () => {
      window.clearInterval(refreshInterval);
    };
  }, []);

  return (
    // @ts-ignore
    <Provider value={{ state, dispatch }}>
      <EnvironmentRouter>{children}</EnvironmentRouter>
    </Provider>
  );
}

EnvironmentProvider.propTypes = {
  children: PropTypes.any,
};

export function useEnvironmentDispatch() {
  const { dispatch } = React.useContext(environmentContext);
  return dispatch;
}

export function useEnvironmentState() {
  const { state } = React.useContext(environmentContext);
  return state;
}

export function useEnvironments() {
  const { state } = React.useContext(environmentContext);
  return state.environments;
}

export function useSelectedEnvironment() {
  const { state } = React.useContext(environmentContext);
  return state.environments[state.selectedKey];
}

export function useAuth() {
  const { state } = React.useContext(environmentContext);
  return state.auth;
}

export function useSelectedEnvironmentAuth() {
  const { state } = React.useContext(environmentContext);
  return state.auth[state.selectedKey];
}

export function useSelectedNormandyEnvironmentAPI() {
  const environment = useSelectedEnvironment();
  const auth = useSelectedEnvironmentAuth();
  return new NormandyAPI(environment, auth);
}

export function useSelectedExperimenterEnvironmentAPI() {
  const environment = useSelectedEnvironment();
  return new ExperimenterAPI(environment);
}

export function updateEnvironment(dispatch, key, config) {
  const storageKey = `environment.${key}.config`;
  if (config) {
    localStorage.setItem(storageKey, JSON.stringify(config));
  } else {
    localStorage.removeItem(storageKey);
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(`environment.${key}.`)) {
        localStorage.removeItem(k);
      }
    });
  }

  dispatch({
    type: ACTION_UPDATE_ENVIRONMENT,
    key,
    config,
  });
}

function getWebAuthForEnvironment(environment) {
  return new auth0.WebAuth({
    domain: environment.oidcDomain,
    audience: `https://${environment.oidcDomain}/userinfo`,
    clientID: environment.oidcClientId,
    redirectUri: browser.identity.getRedirectURL(),
    responseType: "token id_token",
    scope: "openid profile email offline_access",
  });
}

function setSession(dispatch, selectedKey, authResult) {
  const { expiresIn } = authResult;

  let expiresAt = Date.now();
  if (expiresIn) {
    expiresAt += authResult.expiresIn * SECOND;
    localStorage.setItem(
      `environment.${selectedKey}.auth.expiresAt`,
      JSON.stringify(expiresAt),
    );
  }

  localStorage.setItem(
    `environment.${selectedKey}.auth.result`,
    JSON.stringify(authResult),
  );

  dispatch({
    type: ACTION_UPDATE_AUTH,
    key: selectedKey,
    result: authResult,
    expiresAt,
  });
}

async function launchWebAuthFlow(
  dispatch,
  selectedKey,
  environment,
  details = {},
) {
  const nonce = generateNonce(16);
  const state = generateNonce(16);

  const webAuth = getWebAuthForEnvironment(environment);

  const buildUrlOptions = {
    state,
    nonce,
  };

  if ("interactive" in details && !details.interactive) {
    buildUrlOptions.prompt = "none";
  }

  const redirectUri = await browser.identity.launchWebAuthFlow({
    interactive: true,
    url: webAuth.client.buildAuthorizeUrl(buildUrlOptions),
    ...details,
  });

  const hash = redirectUri.split("#").splice(1).join("#");

  return new Promise((resolve, reject) => {
    webAuth.parseHash(
      {
        hash: `#${hash}`,
        state,
        nonce,
      },
      (err, authResult) => {
        if (authResult && !err) {
          setSession(dispatch, selectedKey, authResult);
          resolve();
        } else {
          reject(normalizeErrorObject(err));
        }
      },
    );
  });
}

export async function login(dispatch, selectedKey, environment) {
  dispatch({
    isLoggingIn: true,
    type: ACTION_SET_IS_LOGGING_IN,
  });

  let result;
  try {
    result = await launchWebAuthFlow(dispatch, selectedKey, environment, {
      interactive: false,
    });
  } catch {
    console.info(
      "Non-interactive authentication failed, prompting for interaction...",
    );

    try {
      result = await launchWebAuthFlow(dispatch, selectedKey, environment);
    } catch (err) {
      dispatch({
        isLoggingIn: false,
        type: ACTION_SET_IS_LOGGING_IN,
      });
      throw err;
    }
  }

  dispatch({
    isLoggingIn: false,
    type: ACTION_SET_IS_LOGGING_IN,
  });

  return result;
}

export function refreshToken(dispatch, selectedKey, environment) {
  console.info(`Refreshing the Auth0 access token for "${selectedKey}"...`);
  return launchWebAuthFlow(dispatch, selectedKey, environment, {
    interactive: false,
  });
}

export function logout(dispatch, selectedKey) {
  localStorage.removeItem(`environment.${selectedKey}.auth.result`);
  localStorage.removeItem(`environment.${selectedKey}.auth.expiresAt`);
  dispatch({
    type: ACTION_UPDATE_AUTH,
    key: selectedKey,
    result: null,
    expiresAt: null,
  });
}
