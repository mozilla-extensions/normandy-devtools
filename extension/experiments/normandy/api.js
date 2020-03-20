/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "normandy" }]*/
ChromeUtils.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetters(this, {
  ActionsManager: "resource://normandy/lib/ActionsManager.jsm",
  AddonStudies: "resource://normandy/lib/AddonStudies.jsm",
  ClientEnvironment: "resource://normandy/lib/ClientEnvironment.jsm",
  FilterExpressions:
    "resource://gre/modules/components-utils/FilterExpressions.jsm",
  PreferenceExperiments: "resource://normandy/lib/PreferenceExperiments.jsm",
  RecipeRunner: "resource://normandy/lib/RecipeRunner.jsm",
  Services: "resource://gre/modules/Services.jsm",
});

const PREF_NORMANDY_ENABLE = "app.normandy.enabled";

const { EventManager } = ExtensionCommon;
const { ExtensionError } = ExtensionUtils;

var normandy = class extends ExtensionAPI {
  getAPI(context) {
    return {
      experiments: {
        normandy: {
          async getManualMode() {
            return !Services.prefs.getBoolPref(PREF_NORMANDY_ENABLE, true);
          },

          async setManualMode(manualMode) {
            Services.prefs.setBoolPref(PREF_NORMANDY_ENABLE, !manualMode);
            if (manualMode) {
              Services.prefs.setIntPref("app.normandy.logging.level", 0);
            } else {
              Services.prefs.clearUserPref("app.normandy.logging.level");
            }
          },

          async getClientContext(recipe = undefined) {
            if (!recipe) {
              recipe = { id: 1, arguments: {} };
            }
            let context = RecipeRunner.getFilterContext(recipe);

            // context.normandy is a proxy object that can't be sent to the
            // webextension directly. Instead, manually copy relevant keys to a
            // simple object, and return that.

            let builtContext = { normandy: {}, env: {} };

            // Walk up the class chain for ClientEnvironment, collecting
            // applicable keys as we go. Stop when we get to an unnamed object,
            // which is usually just a plain function is the super class of a
            // class that doesn't extend anything. Also stop if we get to an
            // undefined object, just in case.
            let env = ClientEnvironment;
            let keys = new Set();
            while (env && env.name) {
              for (const [name, descriptor] of Object.entries(
                Object.getOwnPropertyDescriptors(env),
              )) {
                // All of the properties we are looking for are are static getters (so
                // will have a truthy `get` property) and are defined on the class, so
                // will be configurable
                if (descriptor.configurable && descriptor.get) {
                  keys.add(name);
                }
              }
              // Check for the next parent
              env = Object.getPrototypeOf(env);
            }

            // it is generally safe to await values that aren't promises, just a bit inefficient
            for (const key of keys) {
              try {
                if (key == "liveTelemetry") {
                  // Live Telemetry is a weird proxy object. Unpack it.
                  builtContext.normandy.liveTelemetry = {
                    main: await context.normandy.liveTelemetry.main,
                  };
                  builtContext.env.liveTelemetry = {
                    main: await context.env.liveTelemetry.main,
                  };
                } else if (key == "appinfo") {
                  // appinfo can't be directly cloned, but we can manually clone most of it
                  let appinfo = context.env.appinfo;
                  let appinfoCopy = {};
                  for (const name of Object.keys(
                    Object.getOwnPropertyDescriptors(appinfo),
                  )) {
                    // ignore functions and objects
                    try {
                      const value = appinfo[name];
                      if (
                        typeof value != "function" &&
                        typeof value != "object"
                      ) {
                        appinfoCopy[name] = value;
                      } else if (typeof value == "object") {
                        console.warn(
                          `Ignoring appinfo key ${name} with type ${typeof value}:`,
                          value,
                        );
                      }
                    } catch (e) {
                      console.warn(
                        `Couldn't get appinfo key ${name}: ${e.name}`,
                      );
                    }
                  }

                  builtContext.normandy[key] = appinfoCopy;
                  builtContext.env[key] = appinfoCopy;
                } else {
                  const value = Cu.cloneInto(await context.env[key], {});
                  builtContext.normandy[key] = value;
                  builtContext.env[key] = value;
                }
              } catch (err) {
                builtContext.normandy[key] = "<error>";
                builtContext.env[key] = "<error>";
                console.warn(`Could not get context key ${key}: ${err}`);
              }
            }
            return builtContext;
          },

          async evaluateFilter(filter, context = {}) {
            try {
              return await FilterExpressions.eval(filter, context);
            } catch (e) {
              throw new ExtensionError(e.message);
            }
          },

          async checkRecipeFilter(recipe) {
            return RecipeRunner.checkFilter(recipe);
          },

          async runRecipe(recipe) {
            const actions = new ActionsManager();
            if (actions.fetchRemoteActions) {
              // This is deprecated so only run if it exists
              await actions.fetchRemoteActions();
            }
            if (actions.preExecution) {
              // This is deprecated so only run if it exists
              await actions.preExecution();
            }
            if (actions.processRecipe) {
              await actions.processRecipe(
                recipe,
                "RECIPE_SUITABILITY_FILTER_MATCH",
              );
            } else if (actions.runRecipe) {
              await actions.runRecipe(recipe);
            }
            // Don't finalize, to avoid unenrolling users from studies
          },

          onManualMode: new EventManager({
            context,
            name: "normandy.onManualMode",
            register: fire => {
              const observer = {
                observe(subject, topic) {
                  switch (topic) {
                    case "nsPref:changed": {
                      fire.async(
                        !Services.prefs.getBoolPref(PREF_NORMANDY_ENABLE, true),
                      );
                      break;
                    }
                  }
                },
              };
              Services.prefs.addObserver(PREF_NORMANDY_ENABLE, observer);
              return () =>
                Services.prefs.removeObserver(PREF_NORMANDY_ENABLE, observer);
            },
          }).api(),

          onNormandyLog: new EventManager({
            context,
            name: "normandy.onNormandyLog",
            register: fire => {
              const messageLevels = ["debug", "info", "warn", "error"];

              const observer = {
                observe(message) {
                  if (message.message.toLowerCase().includes("normandy")) {
                    let cleanMessage = message.message;
                    if (cleanMessage.includes("\t")) {
                      // Try to clean some stuff up
                      cleanMessage = cleanMessage.replace(
                        /^\d+\s+app\.normandy\.(\S*)\s+[A-Z]+\s+/,
                        (_, mod) => `${mod}: `,
                      );
                    }
                    fire.async({
                      message: cleanMessage,
                      level: messageLevels[message.logLevel],
                      timeStamp: message.timeStamp,
                    });
                  }
                },
              };
              Services.console.registerListener(observer);
              return () => Services.console.unregisterListener(observer);
            },
          }).api(),

          async standardRun() {
            await RecipeRunner.run();
          },

          async getPreferenceStudies() {
            return PreferenceExperiments.getAll();
          },

          async getAddonStudies() {
            return AddonStudies.getAll();
          },
        },
      },
    };
  }
};
