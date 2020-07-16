declare const __BUILD__: {
  version: string;
  commitHash: string;
  hasUncommittedChanges: boolean;
};

declare const DEVELOPMENT: boolean;

declare namespace browser.experiments.normandy {
  type V1Recipe = {};

  type AddonStudy = {};

  type PreferenceStudy = {};

  function runRecipe(recipe: V1Recipe): Promise<void>;

  function getAddonStudies(): Promise<[AddonStudy]>;

  function getPreferenceStudies(): Promise<[PreferenceStudy]>;

  function evaluateFilter(
    expression: string,
    context: {},
  ): Promise<number | string | boolean | null | undefined>;

  function getClientContext(): Promise<{}>;

  function standardRun(): Promise<void>;

  function getRecipeSuitabilities(recipe: V1Recipe): Promise<[string]>;

  function bucketSample(
    input: Array<string>,
    start: number,
    count: number,
    total: number,
  ): Promise<boolean>;

  function ratioSample(input: string, branches: Array<number>): Promise<number>;
}
