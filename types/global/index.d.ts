/* eslint-disable @typescript-eslint/no-unused-vars */
declare const __BUILD__: {
  version: string;
  commitHash: string;
  hasUncommittedChanges: boolean;
};

declare const DEVELOPMENT: boolean;

declare const __ENV__: "web" | "extension";

declare const __TESTING__: boolean;

declare const restoreConsole: () => void;
declare const modifyConsole: () => void;

declare namespace browser.experiments.normandy {
  type V1Recipe = Record<string, unknown>;

  type AddonStudy = Record<string, unknown>;

  type PreferenceStudy = Record<string, unknown>;

  function runRecipe(recipe: V1Recipe): Promise<void>;

  function getAddonStudies(): Promise<[AddonStudy]>;

  function getPreferenceStudies(): Promise<[PreferenceStudy]>;

  function evaluateFilter(
    expression: string,
    context: Record<string, unknown>,
  ): Promise<number | string | boolean | null | undefined>;

  function getClientContext(): Promise<Record<string, unknown>>;

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

declare const renderWithContext: (
  ui: React.ReactElement,
  options?: {
    /** The URL the browser is viewing, like `/prod/recipe/270` */
    route?: string;
    /** The pattern the router is matching, like `/:env/recipe/:recipeId` */
    path?: string;
    history?: import("history").MemoryHistory;
  },
) => import("@testing-library/react").RenderResult & {
  history: import("history").MemoryHistory;
};
