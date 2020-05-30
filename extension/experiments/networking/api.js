/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "networking" }]*/
ChromeUtils.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetters(this, {
  Services: "resource://gre/modules/Services.jsm",
});

const networking = class extends ExtensionAPI {
  getAPI() {
    return {
      experiments: {
        networking: {
          pruneAllConnections() {
            Services.obs.notifyObservers(null, "net:prune-all-connections");
          },
        },
      },
    };
  }
};
