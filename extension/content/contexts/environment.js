import PropTypes from "prop-types";
import React from "react";
import { Route, Redirect, Switch, useParams } from "react-router-dom";
import auth0 from "auth0-js";

import { DEFAULT_ENV, ENVIRONMENTS } from "devtools/config";
import NormandyAPI from "devtools/utils/normandyApi";
import ExperimenterAPI from "devtools/utils/experimenterApi";
import { generateNonce, normalizeErrorObject } from "devtools/utils/auth0";

const LOGIN_FAILED_CODES = [
  "login_required",
  "consent_required",
  "interaction_required",
];

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
};
export const environmentContext = React.createContext(initialState);
const { Provider } = environmentContext;

export const ACTION_SELECT_ENVIRONMENT = "SELECT_ENVIRONMENT";
export const ACTION_UPDATE_ENVIRONMENT = "UPDATE_ENVIRONMENT";
export const ACTION_UPDATE_AUTH = "UPDATE_AUTH";
export const ACTION_UPDATE_AUTH_EXPIRES_AT = "UPDATE_AUTH_EXPIRES_AT";
export const ACTION_UPDATE_AUTH_RESULT = "UPDATE_AUTH_RESULT";

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

      /* eslint-disable no-unused-vars */
      const { [action.key]: _omitEnv, ...newEnvironments } = state.environments;
      const { [action.key]: _omitAuth, ...newAuth } = state.auth;
      /* eslint-enable no-unused-vars */
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
    scope: "openid profile email",
  });
}

function setSession(dispatch, selectedKey, authResult) {
  const { expiresIn } = authResult;

  let expiresAt;
  if (expiresIn) {
    expiresAt = authResult.expiresIn * 1000 + new Date().getTime();
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

export async function login(dispatch, selectedKey, environment) {
  const nonce = generateNonce(16);
  const state = generateNonce(16);

  const webAuth = getWebAuthForEnvironment(environment);

  const redirectUri = await browser.identity.launchWebAuthFlow({
    interactive: true,
    url: webAuth.client.buildAuthorizeUrl({
      state,
      nonce,
    }),
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

export function refreshToken(dispatch, selectedKey, environment) {
  const webAuth = getWebAuthForEnvironment(environment);
  const nonce = generateNonce(16);

  console.info("Refreshing the Auth0 access token...");

  return new Promise((resolve, reject) => {
    webAuth.checkSession({ state: "refresh", nonce }, (err, authResult) => {
      if (authResult && !err) {
        setSession(dispatch, selectedKey, authResult);
        resolve();
      } else {
        const normalizedErr = normalizeErrorObject(err);
        if (normalizedErr && LOGIN_FAILED_CODES.includes(normalizedErr.code)) {
          // Refreshing the token failed and a fresh login is required so log the user out
          logout(dispatch, selectedKey);
          resolve();
        } else {
          reject(normalizedErr);
        }
      }
    });
  });
}
