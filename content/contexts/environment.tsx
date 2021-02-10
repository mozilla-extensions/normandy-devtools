import auth0, { AuthorizeUrlOptions } from "auth0-js";
import PropTypes from "prop-types";
import React, { Reducer, useMemo } from "react";
import { Route, Redirect, Switch, useParams } from "react-router-dom";

import { DEFAULT_ENV, ENVIRONMENTS } from "devtools/config";
import { generateNonce, normalizeErrorObject } from "devtools/utils/auth0";
import ExperimenterAPI from "devtools/utils/experimenterApi";
import { delay, has } from "devtools/utils/helpers";
import NormandyAPI from "devtools/utils/normandyApi";
import { MINUTE, SECOND } from "devtools/utils/timeConstants";

export interface Environment {
  key: string;
  readOnlyUrl: string;
  writeableUrl: string;
  oidcClientId: string;
  oidcDomain: string;
  experimenterUrl?: string;
}

interface EnvironmentState {
  environments: Record<string, Environment>;
  auth: Record<string, AuthState>;
  connectionStatus: Record<string, boolean>;
  selectedKey: string;
  isLoggingIn: boolean;
}

export interface AuthState {
  expiresAt?: Date | null;
  result?: AuthResult | null;
}

interface AuthResult {
  idTokenPayload: { email: string; picture: string };
  accessToken: string;
}

interface SingleEnvironmentState {
  auth: AuthState;
  connectionStatus: boolean;
  environment: Environment;
  isLoggingIn: boolean;
  selectedKey: string;
}

type Dispatch = React.Dispatch<EnvironmentAction>;

const REFRESH_THRESHOLD_MS = 10 * MINUTE;

const ENV_CONFIG_KEY_RE = /^environment\.([^.]+?)\.config$/;
const AUTH_RESULT_KEY_RE = /^environment\.([^.]+?)\.auth.result$/;
const AUTH_EXPIRES_AT_KEY_RE = /^environment\.([^.]+?)\.auth.expiresAt$/;

const initialEnvironments: Record<string, Environment> = ENVIRONMENTS;
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

const initialState: EnvironmentState = {
  environments: initialEnvironments,
  auth: initialAuth,
  connectionStatus: {},
  selectedKey: DEFAULT_ENV,
  isLoggingIn: false,
};

export const environmentContext = React.createContext({
  state: initialState,
  dispatch: null,
});
const { Provider } = environmentContext;

interface SelectEnvironmentAction {
  type: "SELECT_ENVIRONMENT";
  key: string;
}

interface UpdateEnvironmentAction {
  type: "UPDATE_ENVIRONMENT";
  key: string;
  config: Environment;
}

interface UpdateAuthAction {
  type: "UPDATE_AUTH";
  key: string;
  result: AuthResult;
  expiresAt: Date;
}

interface UpdateAuthExpiresAtAction {
  type: "UPDATE_AUTH_EXPIRES_AT";
  key: string;
  expiresAt: Date;
}

interface UpdateAuthResultAction {
  type: "UPDATE_AUTH_RESULT";
  key: string;
  result: AuthResult;
}

interface SetIsLoggingInAction {
  type: "SET_IS_LOGGING_IN";
  isLoggingIn: boolean;
}

interface SetConnectionStatusAction {
  type: "SET_CONNECTION_STATUS";
  key: string;
  status: boolean;
}

type EnvironmentAction =
  | SelectEnvironmentAction
  | UpdateEnvironmentAction
  | UpdateAuthAction
  | UpdateAuthExpiresAtAction
  | UpdateAuthResultAction
  | SetIsLoggingInAction
  | SetConnectionStatusAction;

function reducer(
  state: EnvironmentState,
  action: EnvironmentAction,
): EnvironmentState {
  switch (action.type) {
    case "UPDATE_ENVIRONMENT":
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

    case "UPDATE_AUTH":
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

    case "UPDATE_AUTH_RESULT":
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

    case "UPDATE_AUTH_EXPIRES_AT":
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

    case "SELECT_ENVIRONMENT":
      return {
        ...state,
        selectedKey: action.key,
      };

    case "SET_IS_LOGGING_IN":
      return {
        ...state,
        isLoggingIn: action.isLoggingIn,
      };

    case "SET_CONNECTION_STATUS":
      return {
        ...state,
        connectionStatus: {
          ...state.connectionStatus,
          [action.key]: action.status,
        },
      };

    default:
      return state;
  }
}

const EnvironmentSelector: React.FC = ({ children }) => {
  const { envKey } = useParams<{ envKey: string }>();
  const environments = useEnvironments();
  const dispatch = useEnvironmentDispatch();

  const allKeys = Object.keys(environments);
  if (!allKeys.includes(envKey)) {
    return <Redirect to={`/${DEFAULT_ENV}`} />;
  }

  React.useEffect(() => {
    dispatch({
      type: "SELECT_ENVIRONMENT",
      key: envKey,
    });
  }, [envKey]);

  return <>{children}</>;
};

const EnvironmentRouter: React.FC = ({ children }) => {
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
};

EnvironmentRouter.propTypes = {
  children: PropTypes.any,
};

export const EnvironmentProvider: React.FC = ({ children }) => {
  const [state, ungatedDispatch] = React.useReducer<
    Reducer<EnvironmentState, EnvironmentAction>
  >(reducer, initialState);

  let mounted = true;
  const gatedDispatch = (action: EnvironmentAction): void => {
    if (mounted) {
      ungatedDispatch(action);
    }
  };

  React.useEffect(() => {
    // Add event listener for changes to local storage
    const storageListener = (ev: StorageEvent): void => {
      [
        [ENV_CONFIG_KEY_RE, "UPDATE_ENVIRONMENT", "config"],
        [AUTH_EXPIRES_AT_KEY_RE, "UPDATE_AUTH_EXPIRES_AT", "expiresAt"],
        [AUTH_RESULT_KEY_RE, "UPDATE_AUTH_RESULT", "result"],
      ].forEach(([regex, actionType, valueName]: [RegExp, string, string]) => {
        const match = ev.key.match(regex);
        if (match) {
          const envKey = match[1];
          gatedDispatch({
            type: actionType,
            key: envKey,
            [valueName]: JSON.parse(ev.newValue) as EnvironmentAction,
          } as EnvironmentAction);
        }
      });
    };

    window.addEventListener("storage", storageListener);

    // Add event listener for network changes
    const networkListener = ({ status }): void => {
      console.info("Checking connection status...");

      Object.keys(ENVIRONMENTS).forEach((key) => {
        gatedDispatch({
          type: "SET_CONNECTION_STATUS",
          status: false,
          key,
        });
      });

      if (status === "up") {
        Object.entries(ENVIRONMENTS).forEach(async ([key, environment]) => {
          let status = true;
          try {
            if (__ENV__ === "extension") {
              // Send a notification to prune all active TCP connections
              // This is required to work around https://bugzilla.mozilla.org/show_bug.cgi?id=1635935
              browser.experiments.networking.pruneAllConnections();
            }

            const normandyApi = new NormandyAPI(environment);
            await checkVPNStatus(normandyApi, 5);
          } catch {
            status = false;
          }

          gatedDispatch({
            type: "SET_CONNECTION_STATUS",
            status,
            key,
          });
        });
      }
    };

    browser.networkStatus.onConnectionChanged.addListener(networkListener);

    // Trigger VPN check on load
    networkListener({ status: "up" });

    // Clean up
    return () => {
      window.removeEventListener("storage", storageListener);
      browser.networkStatus.onConnectionChanged.removeListener(networkListener);
      mounted = false;
    };
  }, []);

  const checkExpiredAuth = (): void => {
    console.info(`Checking for expired Auth0 tokens...`);
    Object.entries(state.environments).forEach(async ([key, environment]) => {
      const { expiresAt } = state.auth[key];
      if (expiresAt) {
        if (Number(expiresAt) - new Date().getTime() <= REFRESH_THRESHOLD_MS) {
          try {
            await refreshToken(gatedDispatch, key, environment);
          } catch (err) {
            console.warn(`Unable to refresh Auth0 access token for "${key}"`);
            console.warn(err);
            logout(gatedDispatch, key);
          }
        }
      } else {
        logout(gatedDispatch, key);
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
    <Provider value={{ state, dispatch: gatedDispatch }}>
      <EnvironmentRouter>{children}</EnvironmentRouter>
    </Provider>
  );
};

EnvironmentProvider.propTypes = {
  children: PropTypes.any,
};

export function useEnvironmentDispatch(): Dispatch {
  const { dispatch } = React.useContext(environmentContext);
  return dispatch;
}

export function useEnvironmentState(): EnvironmentState {
  const { state } = React.useContext(environmentContext);
  return state;
}

export function useEnvironments(): Record<string, Environment> {
  const { state } = React.useContext(environmentContext);
  return state.environments;
}

export function useSelectedEnvironmentState(): SingleEnvironmentState {
  const { state } = React.useContext(environmentContext);
  const { environments, auth, connectionStatus, ...otherState } = state;
  return {
    ...otherState,
    environment: environments[state.selectedKey],
    auth: auth[state.selectedKey],
    connectionStatus: connectionStatus[state.selectedKey],
  };
}

export function useSelectedNormandyEnvironmentAPI(): NormandyAPI {
  const { environment, auth, connectionStatus } = useSelectedEnvironmentState();
  return useMemo(() => new NormandyAPI(environment, auth, connectionStatus), [
    environment,
    auth,
    connectionStatus,
  ]);
}

export function useSelectedExperimenterEnvironmentAPI(): ExperimenterAPI {
  const { environment } = useSelectedEnvironmentState();
  return useMemo(() => new ExperimenterAPI(environment), [environment]);
}

async function checkVPNStatus(
  normandyApi,
  maxAttempts,
  currentAttempt = 0,
): Promise<void> {
  await delay(50 * currentAttempt);
  try {
    await normandyApi.checkLBHeartbeat({
      timeoutAfter: (currentAttempt + 1) * 500,
    });
  } catch (err) {
    if (currentAttempt < maxAttempts) {
      await checkVPNStatus(normandyApi, maxAttempts, currentAttempt + 1);
    } else {
      throw err;
    }
  }
}

export function updateEnvironment(
  dispatch: React.Dispatch<EnvironmentAction>,
  key: string,
  config: Environment,
): void {
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
    type: "UPDATE_ENVIRONMENT",
    key,
    config,
  });
}

function getWebAuthForEnvironment(environment): auth0.WebAuth {
  return new auth0.WebAuth({
    domain: environment.oidcDomain,
    audience: `https://${environment.oidcDomain}/userinfo`,
    clientID: environment.oidcClientId,
    redirectUri: browser.identity.getRedirectURL(),
    responseType: "token id_token",
    scope: "openid profile email offline_access",
  });
}

function setSession(dispatch, selectedKey, authResult): void {
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
    type: "UPDATE_AUTH",
    key: selectedKey,
    result: authResult,
    expiresAt,
  });
}

async function launchWebAuthFlow(
  dispatch: Dispatch,
  selectedKey: string,
  environment: Environment,
  details = {},
): Promise<void> {
  const nonce = generateNonce(16);
  const state = generateNonce(16);

  const webAuth = getWebAuthForEnvironment(environment);

  const buildUrlOptions: { state: string; nonce: string; prompt?: string } = {
    state,
    nonce,
  };

  if (has("interactive", details) && !details.interactive) {
    buildUrlOptions.prompt = "none";
  }

  const redirectUri = await browser.identity.launchWebAuthFlow({
    interactive: true,
    url: webAuth.client.buildAuthorizeUrl(
      // The types say this isn't right, but the docs say it is ok, and it works.
      buildUrlOptions as AuthorizeUrlOptions,
    ),
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

export async function login(
  dispatch: Dispatch,
  selectedKey: string,
  environment: Environment,
): Promise<void> {
  dispatch({
    isLoggingIn: true,
    type: "SET_IS_LOGGING_IN",
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
        type: "SET_IS_LOGGING_IN",
      });
      throw err;
    }
  }

  dispatch({
    isLoggingIn: false,
    type: "SET_IS_LOGGING_IN",
  });

  return result;
}

export function refreshToken(
  dispatch: Dispatch,
  selectedKey: string,
  environment: Environment,
): Promise<unknown> {
  console.info(`Refreshing the Auth0 access token for "${selectedKey}"...`);
  return launchWebAuthFlow(dispatch, selectedKey, environment, {
    interactive: false,
  });
}

export function logout(dispatch: Dispatch, selectedKey: string): void {
  localStorage.removeItem(`environment.${selectedKey}.auth.result`);
  localStorage.removeItem(`environment.${selectedKey}.auth.expiresAt`);
  dispatch({
    type: "UPDATE_AUTH",
    key: selectedKey,
    result: null,
    expiresAt: null,
  });
}
