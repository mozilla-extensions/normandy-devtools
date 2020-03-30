import auth0 from "auth0-js";
import autobind from "autobind-decorator";

const LOGIN_FAILED_CODES = [
  "login_required",
  "consent_required",
  "interaction_required",
];

@autobind
class AuthSession {
  constructor(key, environment) {
    this.key = key;

    this.handlers = {
      login: [],
      logout: [],
    };

    this.webAuth = new auth0.WebAuth({
      domain: environment.oidcDomain,
      audience: `https://${environment.oidcDomain}/userinfo`,
      clientID: environment.oidcClientId,
      redirectUri: browser.identity.getRedirectURL(),
      responseType: "token id_token",
      scope: "openid profile email",
    });
  }

  get expiresAt() {
    return JSON.parse(
      localStorage.getItem(`environment.${this.key}.auth.expiresAt`),
    );
  }

  get authResult() {
    return JSON.parse(
      localStorage.getItem(`environment.${this.key}.auth.result`),
    );
  }

  get accessToken() {
    const { authResult } = this;
    return authResult && authResult.accessToken;
  }

  get profile() {
    const { authResult } = this;
    return authResult && authResult.idTokenPayload;
  }

  /**
   * Register a new event handler.
   *
   * @param {string} event  The name of the event.
   * @param {function} handler  A callback function.
   */
  registerHandler(event, handler) {
    if (!this.handlers[event]) {
      throw new Error("Invalid event.");
    }
    this.handlers[event].push(handler);
  }

  /**
   * Unregister an event handler.
   *
   * @param {string} event  The name of the event.
   * @param {function} handler  A callback function.
   */
  unregisterHandler(event, handler) {
    if (!this.handlers[event]) {
      throw new Error("Invalid event.");
    }
    this.handlers[event] = this.handlers[event].filter(h => h !== handler);
  }

  /**
   * Generate a random string to use as a nonce.
   *
   * Sourced from:
   * https://auth0.com/docs/api-auth/tutorials/nonce#generate-a-cryptographically-random-nonce
   *
   * @param {int} length  The length of the generated string.
   * @returns {string}
   */
  generateNonce(length) {
    const charset =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~";
    let result = "";

    while (length > 0) {
      const bytes = new Uint8Array(16);
      const random = window.crypto.getRandomValues(bytes);

      random.forEach(function(c) {
        if (length == 0) {
          return;
        }
        if (c < charset.length) {
          result += charset[c];
          length--;
        }
      });
    }
    return result;
  }

  /**
   * Confirm whether a session exists and is still valid. If it has expired attempt to refresh.
   *
   * @param {int} refreshThreshold  How long before the expiration time to trigger a refresh.
   */
  confirmAuthentication(refreshThreshold = 0) {
    const { expiresAt, authResult } = this;
    if (expiresAt && authResult) {
      if (expiresAt - new Date().getTime() <= refreshThreshold) {
        this.refresh();
      } else {
        this.setSession(authResult);
      }
    } else {
      this.logout();
    }
  }

  /**
   * Begin the authentication flow.
   *
   * @returns {Promise<any>}
   */
  async login() {
    const nonce = this.generateNonce(16);
    const state = this.generateNonce(16);

    const redirectUri = await browser.identity.launchWebAuthFlow({
      interactive: true,
      url: this.webAuth.client.buildAuthorizeUrl({
        state,
        nonce,
      }),
    });

    console.log(redirectUri);

    const hash = redirectUri
      .split("#")
      .splice(1)
      .join("#");

    return new Promise((resolve, reject) => {
      this.webAuth.parseHash(
        {
          hash: `#${hash}`,
          state,
          nonce,
        },
        (err, authResult) => {
          if (authResult && !err) {
            this.setSession(authResult);
            resolve();
          } else {
            reject(this.normalizeErrorObject(err));
          }
        },
      );
    });
  }

  /**
   * Logs a user out.
   */
  logout() {
    localStorage.removeItem(`environment.${this.key}.auth.result`);
    localStorage.removeItem(`environment.${this.key}.auth.expiresAt`);
    this.handlers.logout.forEach(handler => {
      handler();
    });
  }

  /**
   * Attempts to refresh the session.
   *
   * @returns {Promise<void>}
   */
  async refresh() {
    console.info("Refreshing the auth0 access token...");

    try {
      const authResult = await this.checkSession();
      this.setSession(authResult);
    } catch (err) {
      if (err && LOGIN_FAILED_CODES.includes(err.code)) {
        // Refreshing the token failed and a fresh login is required so log the user out
        this.logout();
      } else {
        throw err;
      }
    }
  }

  /**
   * Processes an `authResult` object and stores it.
   *
   * @param authResult  The object to be processed.
   */
  setSession(authResult) {
    const { expiresIn } = authResult;

    if (expiresIn) {
      const expiresAt = authResult.expiresIn * 1000 + new Date().getTime();
      localStorage.setItem(
        `environment.${this.key}.auth.expiresAt`,
        JSON.stringify(expiresAt),
      );
    }

    localStorage.setItem(
      `environment.${this.key}.auth.result`,
      JSON.stringify(authResult),
    );

    this.handlers.login.forEach(handler => {
      handler(authResult);
    });
  }

  /**
   * Checks the Auth0 session.
   *
   * @returns {Promise<any>}
   */
  checkSession() {
    const nonce = this.generateNonce(16);

    return new Promise((resolve, reject) => {
      this.webAuth.checkSession(
        { state: "refresh", nonce },
        (err, authResult) => {
          if (authResult && authResult.idTokenPayload.nonce === nonce && !err) {
            resolve(authResult);
          } else {
            reject(this.normalizeErrorObject(err));
          }
        },
      );
    });
  }

  /**
   * Normalizes the shape of the error object returned by Auth0.
   *
   * @param err  The error object returned by Auth0
   * @returns {Object}
   */
  normalizeErrorObject(err) {
    const errObj = {};
    errObj.code = err.error || err.code || err.error_code || err.status || null;
    errObj.description =
      err.errorDescription ||
      err.error_description ||
      err.description ||
      err.error ||
      err.details ||
      err.err ||
      null;
    return errObj;
  }
}

export default AuthSession;
