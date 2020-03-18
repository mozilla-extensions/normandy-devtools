import autobind from "autobind-decorator";

import AuthSession from "devtools/utils/authSession";
import { ENVIRONMENTS } from "devtools/config";

@autobind
class Environment {
  constructor(key, config) {
    this.key = key;
    this.readOnlyUrl = config.readOnlyUrl;
    this.writeableUrl = config.writeableUrl;
    this.oidcClientId = config.oidcClientId;
    this.oidcDomain = config.oidcDomain;
    this.authSession = new AuthSession(key, config);
    this.authSession.registerHandler("login", this.handleLogin);
    this.authSession.registerHandler("logout", this.handleLogout);
  }

  handleLogin(authResult) {
    this.setAuthToken();
  }

  isAuthenticated() {
    return !!this.authSession.authResult;
  }

  getUrl() {
    return this.writeable ? this.writeableUrl : this.readOnlyUrl;
  }
}

class EnvironmentStore {
  constructor() {
    this.reset();
  }

  has(key) {
    return key in this.environments;
  }

  getAll() {
    return this.environments;
  }

  get(key) {
    return this.environments[key];
  }

  set(key, config) {
    localStorage.setItem(`environment.${key}.config`, JSON.stringify(config));
    this.environments[key] = new Environment(key, config);
  }

  remove(key) {
    delete this.environments[key];
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(`environment.${key}.`)) {
        localStorage.removeItem(k);
      }
    });
  }

  reset() {
    this.environments = {};

    // Load the default set of environments
    Object.keys(ENVIRONMENTS).forEach(key => {
      this.environments[key] = new Environment(key, ENVIRONMENTS[key]);
    });

    // Load the configs from localStorage
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith("environment.") && k.endsWith(".config")) {
        const key = k.replace(/^environment\./, "").replace(/\.config$/, "");
        this.environments[key] = new Environment(key, localStorage.getItem(k));
      }
    });
  }

  clear() {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith("environment.")) {
        localStorage.removeItem(k);
      }
    });
    this.reset();
  }
}

export default new EnvironmentStore();
