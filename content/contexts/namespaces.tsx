import _ from "lodash";
import React, { useContext, createContext, ReactElement } from "react";

import {
  NamespaceSampleFilterObject,
  SampleFilterObject,
} from "devtools/types/filters";
import { RecipeV3, Revision } from "devtools/types/recipes";
import NormandyAPI from "devtools/utils/normandyApi";
import {
  getNamespaceForFilter,
  isSamplingFilter,
} from "devtools/utils/recipes";

export interface NamespacesState {
  loading: Set<string>;
  envs: Record<
    string,
    {
      namespaces: Set<string>;
      recipesByNamespace: Record<string, Array<RecipeV3>>;
    }
  >;
}

export type NamespaceAction =
  | AddRecipesAction
  | SetRecipesAction
  | AddNamespacesAction
  | IsLoadingAction;

export interface AddRecipesAction {
  type: "ADD_RECIPES";
  recipes: Array<RecipeV3>;
  environment: string;
}

export interface SetRecipesAction {
  type: "SET_RECIPES";
  namespace: string;
  recipes: Array<RecipeV3>;
  environment: string;
}

export interface AddNamespacesAction {
  type: "ADD_NAMESPACES";
  namespaces: Set<string>;
  environment: string;
}

export interface IsLoadingAction {
  type: "IS_LOADING";
  isLoading: boolean;
  key: string;
}

export function reducer(
  state: NamespacesState,
  action: NamespaceAction,
): NamespacesState {
  switch (action.type) {
    case "ADD_RECIPES": {
      const newMapping: Record<string, Array<RecipeV3>> = {};
      for (const [namespace, idList] of Object.entries(
        state.envs[action.environment]?.recipesByNamespace ?? {},
      )) {
        newMapping[namespace] = [...idList];
      }

      for (const recipe of action.recipes) {
        const samplingFilters: Array<SampleFilterObject> = recipe.latest_revision.filter_object.filter(
          isSamplingFilter,
        );
        for (const fo of samplingFilters) {
          const namespace = getNamespaceForFilter(fo);
          if (!newMapping[namespace]) {
            newMapping[namespace] = [];
          }

          newMapping[namespace].push(recipe);
        }
      }

      return {
        ...state,
        envs: {
          ...state.envs,
          [action.environment]: {
            namespaces: new Set(Object.keys(newMapping)),
            recipesByNamespace: newMapping,
          },
        },
      };
    }

    case "SET_RECIPES": {
      const recipesByNamespace = {
        ...state.envs[action.environment]?.recipesByNamespace,
        [action.namespace]: action.recipes,
      };
      const namespaces = new Set(state.envs[action.environment]?.namespaces);
      for (const ns of Object.keys(recipesByNamespace)) {
        namespaces.add(ns);
      }

      return {
        ...state,
        envs: {
          ...state.envs,
          [action.environment]: {
            recipesByNamespace,
            namespaces,
          },
        },
      };
    }

    case "ADD_NAMESPACES": {
      const namespaces = new Set(action.namespaces);
      for (const ns of state.envs[action.environment]?.namespaces ?? []) {
        namespaces.add(ns);
      }

      return {
        ...state,
        envs: {
          ...state.envs,
          [action.environment]: {
            ...state.envs[action.environment],
            namespaces,
          },
        },
      };
    }

    case "IS_LOADING": {
      const loading = new Set(state.loading);
      if (action.isLoading) {
        loading.add(action.key);
      } else {
        loading.delete(action.key);
      }

      return { ...state, loading };
    }

    default: {
      return state;
    }
  }
}

interface NamespaceHelperCache {
  [cacheKey: string]: { promise: Promise<unknown> };
}

/**
 * The stateless half of the work of tracking namespaces. This class is
 * recreated completely every time that state changes, to properly trigger
 * re-renders. It is scoped to only the currently selected environment.
 */
export class NamespaceInfo {
  constructor(
    private loading: Set<string>,
    public recipesByNamespace: Record<string, Array<RecipeV3>>,
    public namespaces: Set<string>,
    public updateNamespace: (namespace: string) => Promise<void>,
    public updateNamespaceNames: () => Promise<void>,
  ) {}

  /** Check if anything is loading
   * @param needles If passed, only loading items that match the given strings will be considered.
   */
  isLoading(...needles: Array<string>): boolean {
    if (!needles.length) {
      return this.loading.size > 0;
    }

    const loadingItems = Array.from(this.loading);
    return needles.every((needle) =>
      loadingItems.some((item) => item.split("::").includes(needle)),
    );
  }

  findOccupiedBuckets(namespace: string): Array<boolean> {
    // this isn't very efficient, but it works quickly enough
    const occupiedBuckets = Array.from({ length: 10_000 }, () => false);

    for (const recipe of this.recipesByNamespace?.[namespace] ?? []) {
      for (const fo of recipe.latest_revision.filter_object) {
        if (isSamplingFilter(fo)) {
          const foNamespace = getNamespaceForFilter(fo);
          if (foNamespace === namespace) {
            if (fo.type === "stableSample") {
              for (let i = 0; i < fo.rate * 10_000; i++) {
                occupiedBuckets[i] = true;
              }
            } else {
              for (let i = fo.start; i < fo.start + fo.count; i++) {
                occupiedBuckets[i % 10_000] = true;
              }
            }
          }
        }
      }
    }

    return occupiedBuckets;
  }

  // Tries to find a contiguous set of buckets in a namespace `size` buckets
  // long that are entirely unoccupied.
  async findSpaceInNamespace(
    namespace: string,
    size: number,
  ): Promise<number | null> {
    if (size > 10_000) {
      throw new Error(`${size} is too many buckets, must be at most 10,000`);
    }

    await this.updateNamespace(namespace);
    const occupiedBuckets = this.findOccupiedBuckets(namespace);

    for (
      let potentialStart = 0;
      potentialStart < 10_000 - size;
      potentialStart++
    ) {
      let allClear = true;
      for (let scan = potentialStart; scan < potentialStart + size; scan++) {
        const scanTarget = scan % 10_000;
        if (occupiedBuckets[scanTarget]) {
          allClear = false;
          potentialStart = scan;
          break;
        }
      }

      if (allClear) {
        return potentialStart;
      }
    }

    return null;
  }

  /** Update `recipeData` in-place for any sampling filters that requested automatic bucketing */
  async updateSamplingForAutoBucketing(recipeData: Revision): Promise<void> {
    const samplingFilters: Array<NamespaceSampleFilterObject> = recipeData.filter_object?.filter(
      (fo): fo is NamespaceSampleFilterObject => fo.type === "namespaceSample",
    );

    for (const fo of samplingFilters) {
      if (fo.auto) {
        const namespace = getNamespaceForFilter(fo);
        const autoStart = await this.findSpaceInNamespace(namespace, fo.count);
        if (autoStart === null) {
          throw new Error(
            `Could not find room for ${fo.count} buckets in ${namespace}`,
          );
        }

        fo.start = autoStart;
      }

      delete fo.auto;
    }
  }
}

export const namespaceContext = createContext<NamespaceInfo>(null);
const { Provider } = namespaceContext;

export function useNamespaceInfo(): NamespaceInfo {
  return useContext(namespaceContext);
}

interface NamespacesProviderProps {
  normandyApi: NormandyAPI;
}

export const INITIAL_STATE: NamespacesState = { loading: new Set(), envs: {} };

/**
 * This is the stateful half of namespace tracking. This object should not be
 * recreated very often, if at all. It also tracks all environments.
 */
export class NamespacesProvider extends React.Component<
  NamespacesProviderProps,
  NamespacesState
> {
  render(): ReactElement {
    const value = new NamespaceInfo(
      this.state.loading,
      this.recipesByNamespace,
      this.namespaces,
      this.updateNamespace.bind(this),
      this.updateNamespaceNames.bind(this),
    );
    return <Provider value={value}>{this.props.children}</Provider>;
  }

  private cache: NamespaceHelperCache;

  constructor(props: NamespacesProviderProps) {
    super(props);
    this.state = {
      loading: new Set() as Set<string>,
      envs: {},
    };

    this.cache = {};
  }

  dispatch(action: NamespaceAction): void {
    this.setState((oldState) => reducer(oldState, action));
  }

  get environment(): string {
    return this.props.normandyApi.environment.key;
  }

  get namespaces(): Set<string> {
    // Clone, so that modifications don't leak back in
    return new Set(this.state.envs[this.environment]?.namespaces ?? []);
  }

  get recipesByNamespace(): Record<string, Array<RecipeV3>> {
    // Clone, so that modifications don't leak back in
    return { ...this.state.envs[this.environment]?.recipesByNamespace };
  }

  /**
   * Load all recipes that belong to `namespace` in `environment`.
   */
  async updateNamespace(namespace: string): Promise<void> {
    const queries = [
      `type:bucketSample,input:${namespace}`,
      `type:stableSample,input:${namespace}`,
      `type:namespaceSample,namespace:${namespace}`,
    ];

    let recipes = (
      await Promise.all(
        queries.map((q) => {
          const key = `updateNamespace::${this.environment}::${namespace}::${q}`;
          if (!this.cache[key]) {
            this.dispatch({ type: "IS_LOADING", key, isLoading: true });
            this.cache[key] = {
              promise: this.props.normandyApi.fetchAllRecipes({
                filter_object: q,
              }),
            };
            this.cache[key].promise.then(() =>
              this.dispatch({ type: "IS_LOADING", key, isLoading: false }),
            );
          }

          return this.cache[key].promise as Promise<Array<RecipeV3>>;
        }),
      )
    ).flat();

    recipes = _.uniqBy(recipes, (r) => r.id);

    this.dispatch({
      type: "SET_RECIPES",
      namespace,
      environment: this.environment,
      recipes,
    });
  }

  /**
   * Populate the list of namespaces for `environment`. Does not fill in the
   * recipes for that environment.
   */
  async updateNamespaceNames(): Promise<void> {
    // TODO This is currently pretty slow since it effectively loads every
    // recipe on the server. It could go faster by caching the namespaces and
    // only updating if we see a new recipe or calculate it on the server.
    const queries = [
      `type:bucketSample`,
      `type:stableSample`,
      `type:namespaceSample`,
    ];
    // Although this fetches recipes as a side-effect, don't store them in the
    // state so that we can use potentially faster methods that don't have the
    // same side-effect in the future.
    let recipes: Array<RecipeV3> = (
      await Promise.all(
        queries.map((query) => {
          const key = `updateNamespaceNames::${this.environment}::${query}`;
          if (!this.cache[key]) {
            this.dispatch({ type: "IS_LOADING", key, isLoading: true });
            this.cache[key] = {
              promise: this.props.normandyApi.fetchAllRecipes({
                filter_object: query,
              }),
            };
            this.cache[key].promise.then(() =>
              this.dispatch({ type: "IS_LOADING", key, isLoading: false }),
            );
          }

          return this.cache[key].promise as Promise<Array<RecipeV3>>;
        }),
      )
    ).flat();

    recipes = _.uniqBy(recipes, (r) => r.id);

    const namespaces: Set<string> = new Set();
    for (const recipe of recipes) {
      for (const fo of recipe.latest_revision.filter_object) {
        if (isSamplingFilter(fo)) {
          const namespace = getNamespaceForFilter(fo);
          if (namespace) {
            namespaces.add(namespace);
          }
        }
      }
    }

    this.dispatch({
      type: "ADD_NAMESPACES",
      environment: this.props.normandyApi.environment.key,
      namespaces,
    });
  }
}
