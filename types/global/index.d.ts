declare namespace browser.experiments.normandy {
  type V1Recipe = {};

  type AddonStudy = {};

  type PreferenceStudy = {};

  function runRecipe(recipe: V1Recipe): Promise<void>;

  function getAddonStudies(): Promise<[AddonStudy]>;

  function getPreferenceStudies(): Promise<[PreferenceStudy]>;

  function evaluateFilter(expression: string, context: {}): Promise<any>;

  function getClientContext(): Promise<{}>;

  function standardRun(): Promise<void>;

  function getRecipeSuitabilities(recipe: V1Recipe): Promise<[string]>;
}
