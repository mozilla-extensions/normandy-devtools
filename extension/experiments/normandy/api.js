/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "normandy" }]*/
ChromeUtils.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetters(this, {
  Services: "resource://gre/modules/Services.jsm",
  ActionsManager: "resource://normandy/lib/ActionsManager.jsm",
  RecipeRunner: "resource://normandy/lib/RecipeRunner.jsm",
  FilterExpressions:
    "resource://gre/modules/components-utils/FilterExpressions.jsm",
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
            // webextension directly. Instead, manually copy relavent keys to a
            // simple object, and return that.
            let builtContext = { normandy: {} };
            const keysToCopy = [
              "recipe",
              "userId",
              "isFirstRun",
              "distribution",
              "version",
              "channel",
              "isDefaultBrowser",
              "syncSetup",
              "syncDesktopDevices",
              "syncMobileDevices",
              "syncTotalDevices",
              "locale",
              "doNotTrack",
            ];
            const keysToAwait = [
              "country",
              "request_time",
              "experiments",
              "searchEngine",
              "addons",
              "plugins",
              "telemetry",
            ];
            for (const key of keysToCopy) {
              builtContext.normandy[key] = context.normandy[key];
            }
            for (const key of keysToAwait) {
              builtContext.normandy[key] = await context.normandy[key];
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
            await actions.fetchRemoteActions();
            await actions.preExecution();
            await actions.runRecipe(recipe);
            // Don't finalze, to avoid unenrolling users from studies
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
        },
      },
    };
  }
};
