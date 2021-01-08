import faker from "faker";
import _ from "lodash";

import { ENVIRONMENTS } from "devtools/config";
import {
  reducer,
  INITIAL_STATE,
  NamespacesState,
  NamespaceInfo,
  NamespacesProvider,
} from "devtools/contexts/namespaces";
import { filterObjectFactory } from "devtools/tests/factories/filterObjects";
import {
  recipeFactory,
  revisionFactory,
} from "devtools/tests/factories/recipes";
import { RecipeV3 } from "devtools/types/recipes";
import { Deferred } from "devtools/utils/helpers";
import NormandyAPI from "devtools/utils/normandyApi";
import {
  getNamespaceForFilter,
  isSamplingFilter,
} from "devtools/utils/recipes";

beforeAll(() => {
  restoreConsole();
});

afterAll(() => {
  modifyConsole();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("namespaces reducer", () => {
  it("should not modify the state for unexpected actions", () => {
    const oldState = { ...INITIAL_STATE };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const newState = reducer(oldState, { type: "unexpected" });
    expect(newState).toBe(oldState);
  });

  describe("ADD_RECIPES action", () => {
    it("should add recipes to the correct environment and namespace", () => {
      const namespace = faker.random.word();
      const environment = faker.random.word();
      const [recipe1, recipe2] = recipeFactory.buildCount(2, {
        latest_revision: {
          filter_object: [
            filterObjectFactory.build({
              type: "namespaceSample",
              namespace,
            }),
          ],
        },
      });

      // Adding the first one should create the environment and namespace entry.
      let state = INITIAL_STATE;
      state = reducer(state, {
        type: "ADD_RECIPES",
        environment,
        recipes: [recipe1],
      });
      expect(state.envs).toEqual({
        [environment]: {
          namespaces: new Set([namespace]),
          recipesByNamespace: {
            [namespace]: [recipe1],
          },
        },
      });

      // Adding the second should just append it to the list.
      state = reducer(state, {
        type: "ADD_RECIPES",
        environment,
        recipes: [recipe2],
      });
      expect(state.envs).toEqual({
        [environment]: {
          namespaces: new Set([namespace]),
          recipesByNamespace: {
            [namespace]: [recipe1, recipe2],
          },
        },
      });
    });
  });

  describe("SET_RECIPES action", () => {
    it("should reset the recipes", () => {
      const namespace = faker.random.word();
      const environment = faker.random.word();
      const [recipe1, recipe2] = recipeFactory.buildCount(2, {
        latest_revision: {
          filter_object: [
            filterObjectFactory.build({
              type: "namespaceSample",
              namespace,
            }),
          ],
        },
      });

      // Adding the first one should create the environment and namespace entry.
      let state = {
        ...INITIAL_STATE,
        envs: {
          [environment]: {
            namespaces: new Set([namespace]),
            recipesByNamespace: {
              [namespace]: [recipe1],
            },
          },
        },
      };
      state = reducer(state, {
        type: "SET_RECIPES",
        environment,
        namespace,
        recipes: [recipe2],
      });
      expect(state.envs).toEqual({
        [environment]: {
          namespaces: new Set([namespace]),
          recipesByNamespace: {
            [namespace]: [recipe2],
          },
        },
      });
    });
  });

  describe("ADD_NAMESPACES", () => {
    it("should add new namespaces", () => {
      const environment = "test-env";
      let state = INITIAL_STATE;
      state = reducer(state, {
        type: "ADD_NAMESPACES",
        namespaces: new Set(["global-v1", "global-v2"]),
        environment,
      });
      expect(state.envs[environment].namespaces).toEqual(
        new Set(["global-v1", "global-v2"]),
      );
    });

    it("should handle duplicate namespaces", () => {
      const environment = "test-env";
      let state: NamespacesState = {
        ...INITIAL_STATE,
        envs: {
          [environment]: {
            namespaces: new Set(["global-v1", "global-v2"]),
            recipesByNamespace: {},
          },
        },
      };

      state = reducer(state, {
        type: "ADD_NAMESPACES",
        namespaces: new Set(["global-v2", "global-v3"]),
        environment,
      });
      expect(state.envs[environment].namespaces).toEqual(
        new Set(["global-v1", "global-v2", "global-v3"]),
      );
    });
  });

  describe("IS_LOADING", () => {
    it("should add new loading items", () => {
      let state = INITIAL_STATE;
      state = reducer(state, {
        type: "IS_LOADING",
        isLoading: true,
        key: "item-1",
      });
      state = reducer(state, {
        type: "IS_LOADING",
        isLoading: true,
        key: "item-2",
      });
      expect(state.loading).toEqual(new Set(["item-1", "item-2"]));
    });

    it("should remove loading items", () => {
      let state = { ...INITIAL_STATE, loading: new Set(["item-1", "item-2"]) };
      state = reducer(state, {
        type: "IS_LOADING",
        isLoading: false,
        key: "item-1",
      });
      expect(state.loading).toEqual(new Set(["item-2"]));
    });

    it("should remove loading items", () => {
      let state = { ...INITIAL_STATE, loading: new Set(["item-1", "item-2"]) };
      state = reducer(state, {
        type: "IS_LOADING",
        isLoading: true,
        key: "item-1",
      });
      expect(state.loading).toEqual(new Set(["item-1", "item-2"]));
    });

    it("should not break if a non-existent loading item is removed", () => {
      let state = INITIAL_STATE;
      state = reducer(state, {
        type: "IS_LOADING",
        isLoading: false,
        key: "item-1",
      });
      expect(state.loading.size).toEqual(0);
    });
  });
});

describe("NamespaceInfo", () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const noop: () => Promise<void> = async () => {};
  function setup({
    recipe = null,
    recipes = new Array<RecipeV3>(),
    loading = new Set<string>(),
    recipesByNamespace = {},
    namespaces = new Set<string>(),
    updateNamespace = noop,
    updateNamespaceNames = noop,
  } = {}): NamespaceInfo {
    if (recipe) {
      recipes.push(recipe);
    }

    for (const recipe of recipes) {
      for (const fo of recipe.latest_revision.filter_object ?? []) {
        if (isSamplingFilter(fo)) {
          const namespace = getNamespaceForFilter(fo);
          namespaces.add(namespace);
          if (!recipesByNamespace[namespace]) {
            recipesByNamespace[namespace] = [];
          }

          recipesByNamespace[namespace].push(recipe);
        }
      }
    }

    return new NamespaceInfo(
      loading,
      recipesByNamespace,
      namespaces,
      updateNamespace,
      updateNamespaceNames,
    );
  }

  describe("isLoading", () => {
    it("should be false if nothing is loading", () => {
      const info = setup();
      expect(info.isLoading()).toBeFalsy;
      expect(info.isLoading("a")).toBeFalsy;
      expect(info.isLoading("a", "b")).toBeFalsy;
    });

    it("should return true for no params if something is loading", () => {
      const info = setup({ loading: new Set(["something"]) });
      expect(info.isLoading()).toBeTruthy;
    });

    it("should allow filtering the loading items", () => {
      const info = setup({ loading: new Set(["a::b", "c"]) });

      // simple filters
      expect(info.isLoading("a")).toBeTruthy;
      expect(info.isLoading("b")).toBeTruthy;
      expect(info.isLoading("c")).toBeTruthy;
      // matching two parts of a filter
      expect(info.isLoading("a", "b")).toBeTruthy;

      // A mismatched filter
      expect(info.isLoading("d")).toBeFalsy;
      // Can't combine parts of two items
      expect(info.isLoading("a", "c")).toBeFalsy;
      // All items need to be present
      expect(info.isLoading("a", "d")).toBeFalsy;
    });
  });

  describe("findOccupiedBuckets", () => {
    it("should mark used buckets", () => {
      const namespace = faker.lorem.slug(2);
      const recipe = recipeFactory.build({
        latest_revision: {
          filter_object: [
            filterObjectFactory.build({
              type: "namespaceSample",
              start: 200,
              count: 400,
              namespace,
            }),
            filterObjectFactory.build({
              type: "channel",
              channels: ["an unrelated filter"],
            }),
          ],
        },
      });
      const info = setup({ recipe });

      const buckets = info.findOccupiedBuckets(namespace);
      expect(buckets).toHaveLength(10_000);
      expect(buckets.slice(0, 200).every((occupied) => !occupied)).toBeTruthy;
      expect(buckets.slice(200, 600).every((occupied) => occupied)).toBeTruthy;
      expect(buckets.slice(600).every((occupied) => !occupied)).toBeTruthy;
    });

    it("should wrap around at the end", () => {
      const namespace = faker.lorem.slug(2);
      const recipe = recipeFactory.build({
        latest_revision: {
          filter_object: [
            filterObjectFactory.build({
              type: "namespaceSample",
              start: 9_000,
              count: 2_000,
              namespace,
            }),
          ],
        },
      });
      const info = setup({ recipe });

      const buckets = info.findOccupiedBuckets(namespace);
      expect(buckets).toHaveLength(10_000);
      expect(buckets.slice(0, 1_000).every((occupied) => occupied)).toBeTruthy;
      expect(buckets.slice(1_000, 9_000).every((occupied) => !occupied))
        .toBeTruthy;
      expect(buckets.slice(9_000).every((occupied) => occupied)).toBeTruthy;
    });

    it("works with bucketSample filters", () => {
      const namespace = faker.lorem.slug(2);
      const recipe = recipeFactory.build({
        latest_revision: {
          filter_object: [
            filterObjectFactory.build({
              type: "bucketSample",
              start: 200,
              count: 400,
              total: 10_000,
              input: ["normandy.userId", `'${namespace}'`],
            }),
          ],
        },
      });
      const info = setup({ recipe });

      const buckets = info.findOccupiedBuckets(namespace);
      expect(buckets).toHaveLength(10_000);
      expect(buckets.slice(0, 200).every((occupied) => !occupied)).toBeTruthy;
      expect(buckets.slice(200, 600).every((occupied) => occupied)).toBeTruthy;
      expect(buckets.slice(600).every((occupied) => !occupied)).toBeTruthy;
    });

    it("works with stableSample filters", () => {
      const namespace = faker.lorem.slug(2);
      const recipe = recipeFactory.build({
        latest_revision: {
          filter_object: [
            filterObjectFactory.build({
              type: "stableSample",
              rate: 0.5,
              input: ["normandy.userId", `'${namespace}'`],
            }),
          ],
        },
      });
      const info = setup({ recipe });

      const buckets = info.findOccupiedBuckets(namespace);
      expect(buckets).toHaveLength(10_000);
      expect(buckets.slice(0, 5_000).every((occupied) => occupied)).toBeTruthy;
      expect(buckets.slice(5_000).every((occupied) => !occupied)).toBeTruthy;
    });

    it("should ignore other namespaces", () => {
      const namespace1 = faker.lorem.slug(2);
      const namespace2 = faker.lorem.slug(2);
      expect(namespace1).not.toEqual(namespace2);
      const recipes = recipeFactory.buildMany([
        {
          latest_revision: {
            filter_object: [
              filterObjectFactory.build({
                type: "namespaceSample",
                start: 200,
                count: 400,
                namespace: namespace1,
              }),
            ],
          },
        },
        {
          latest_revision: {
            filter_object: [
              filterObjectFactory.build({
                type: "namespaceSample",
                start: 800,
                count: 100,
                namespace: namespace2,
              }),
            ],
          },
        },
      ]);
      const info = setup({ recipes });

      const buckets = info.findOccupiedBuckets(namespace1);
      expect(buckets).toHaveLength(10_000);
      expect(buckets.slice(0, 200).every((occupied) => !occupied)).toBeTruthy;
      expect(buckets.slice(200, 600).every((occupied) => occupied)).toBeTruthy;
      expect(buckets.slice(600).every((occupied) => !occupied)).toBeTruthy;
    });

    it("should work with no recipes", () => {
      const info = setup();
      const buckets = info.findOccupiedBuckets("namespace");
      expect(buckets.every((occupied) => !occupied)).toBeTruthy;
    });
  });

  describe("findSpaceInNamespace", () => {
    it("should work for for an empty namespace", async () => {
      const info = setup();
      const start = await info.findSpaceInNamespace("empty", 100);
      expect(start).toEqual(0);
    });

    it("should find gaps in existing recipes", async () => {
      const namespace = faker.lorem.slug(2);
      const ranges = [
        { start: 0, count: 200 },
        { start: 300, count: 100 },
        { start: 400, count: 150 },
      ];
      const recipes = recipeFactory.buildMany(
        ranges.map(({ start, count }) => ({
          latest_revision: {
            filter_object: [
              filterObjectFactory.build({
                type: "namespaceSample",
                start,
                count,
                namespace,
              }),
            ],
          },
        })),
      );

      const info = setup({ recipes });
      // there is a gap from 200 to 300, but we request 200 buckets. This
      // should report the first bucket at the end of the ranges above.
      expect(await info.findSpaceInNamespace(namespace, 200)).toEqual(550);
    });

    it("should return null if there are no available spaces", async () => {
      const namespace = faker.lorem.slug(2);
      const recipe = recipeFactory.build({
        latest_revision: {
          filter_object: [
            filterObjectFactory.build({
              type: "namespaceSample",
              start: 100,
              count: 9_000,
              namespace,
            }),
          ],
        },
      });

      const info = setup({ recipe });
      expect(await info.findSpaceInNamespace(namespace, 1_000)).toBeNull;
    });
  });

  describe("updateSamplingForAutoBucketing", () => {
    it("shouldn't modify filters if auto is specified", async () => {
      const namespace = faker.lorem.slug(2);
      const recipe = recipeFactory.build({
        latest_revision: {
          filter_object: [
            filterObjectFactory.build({ type: "namespaceSample", namespace }),
          ],
        },
      });

      const originalRecipe = _.cloneDeep(recipe);
      const info = setup({ recipe });
      await info.updateSamplingForAutoBucketing(recipe.latest_revision);
      expect(recipe).toEqual(originalRecipe);
    });

    it("should set start to an open bucket if auto is true", async () => {
      const namespace = faker.lorem.slug(2);
      const filters = filterObjectFactory.buildMany([
        { type: "namespaceSample", namespace, start: 0, count: 100 },
        { type: "namespaceSample", namespace, start: 200, count: 100 },
        { type: "namespaceSample", namespace, start: 250, count: 100 },
      ]);
      const recipes = recipeFactory.buildMany(
        filters.map((fo) => ({
          latest_revision: {
            filter_object: [fo],
          },
        })),
      );

      const info = setup({ recipes });
      const newRevision = revisionFactory.build({
        filter_object: [
          filterObjectFactory.build({
            type: "namespaceSample",
            namespace,
            start: null,
            auto: true,
            count: 200,
          }),
        ],
      });
      await info.updateSamplingForAutoBucketing(newRevision);
      expect(newRevision.filter_object).toEqual([
        {
          type: "namespaceSample",
          namespace,
          start: 350,
          count: 200,
        },
      ]);
    });

    it("should throw an error and not modify the recipe is no space can be found", async () => {
      const namespace = faker.lorem.slug(2);
      const existingRecipe = recipeFactory.build({
        latest_revision: {
          filter_object: [
            { type: "namespaceSample", namespace, start: 0, count: 10_0000 },
          ],
        },
      });

      const info = setup({ recipe: existingRecipe });
      const newRevision = revisionFactory.build({
        filter_object: [
          filterObjectFactory.build({
            type: "namespaceSample",
            namespace,
            start: null,
            auto: true,
            count: 200,
          }),
        ],
      });
      const originalNewRevision = _.cloneDeep(newRevision);
      await expect(async () =>
        info.updateSamplingForAutoBucketing(newRevision),
      ).rejects.toThrowError(/could not find room/i);
      expect(newRevision).toEqual(originalNewRevision);
    });
  });
});

describe("NamespaceProvider", () => {
  describe("updateNamespace", () => {
    it("makes the expected API calls", async () => {
      const namespace = faker.lorem.slug(2);
      const normandyApi = new NormandyAPI(ENVIRONMENTS.local);
      const fetchAllRecipesSpy = jest
        .spyOn(normandyApi, "fetchAllRecipes")
        .mockResolvedValue([]);
      const provider = new NamespacesProvider({ normandyApi });
      await provider.updateNamespace(namespace);
      expect(fetchAllRecipesSpy).toBeCalledWith({
        filter_object: `type:namespaceSample,namespace:${namespace}`,
      });
      expect(fetchAllRecipesSpy).toBeCalledWith({
        filter_object: `type:stableSample,input:${namespace}`,
      });
      expect(fetchAllRecipesSpy).toBeCalledWith({
        filter_object: `type:bucketSample,input:${namespace}`,
      });
      expect(fetchAllRecipesSpy).toBeCalledTimes(3);

      // it shouldn't make any more network calls when called again, since the first three were cached
      await provider.updateNamespace(namespace);
      expect(fetchAllRecipesSpy).toBeCalledTimes(3);
    });
  });

  describe("updateNamespaceNames", () => {
    it("makes the expected API calls", async () => {
      const namespace = faker.lorem.slug(2);
      const normandyApi = new NormandyAPI(ENVIRONMENTS.local);
      const fetchAllRecipesSpy = jest
        .spyOn(normandyApi, "fetchAllRecipes")
        .mockResolvedValue([]);
      const provider = new NamespacesProvider({ normandyApi });
      await provider.updateNamespace(namespace);
      expect(fetchAllRecipesSpy).toBeCalledWith({
        filter_object: `type:namespaceSample,namespace:${namespace}`,
      });
      expect(fetchAllRecipesSpy).toBeCalledWith({
        filter_object: `type:stableSample,input:${namespace}`,
      });
      expect(fetchAllRecipesSpy).toBeCalledWith({
        filter_object: `type:bucketSample,input:${namespace}`,
      });
      expect(fetchAllRecipesSpy).toBeCalledTimes(3);

      // it shouldn't make any more network calls when called again, since the first three were cached
      await provider.updateNamespace(namespace);
      expect(fetchAllRecipesSpy).toBeCalledTimes(3);
    });

    it("dispatches the right action", async () => {
      const namespace = faker.lorem.slug(2);
      const normandyApi = new NormandyAPI(ENVIRONMENTS.local);
      const environment: string = normandyApi.environment.key;
      const recipes = recipeFactory.buildCount(3, {
        latest_revision: {
          filter_object: [
            filterObjectFactory.build({
              type: "namespaceSample",
              namespace,
            }),
          ],
        },
      });

      // This is not actually a very good mock, because it doesn't filter the
      // recipes at all. However the code being tested should be robust to
      // recipes showing up in multiple queries anyways.
      jest.spyOn(normandyApi, "fetchAllRecipes").mockResolvedValue(recipes);

      const provider = new NamespacesProvider({ normandyApi });
      const actions = [];
      jest.spyOn(provider, "dispatch").mockImplementation(function (action) {
        actions.push(action);
        return this.setState((oldState) => reducer(oldState, action));
      });

      await provider.updateNamespace(namespace);

      // First there should be three loading actions
      expect(actions).toHaveLength(7);
      for (const isLoading of [true, false]) {
        for (const query of [
          `type:bucketSample,input:${namespace}`,
          `type:stableSample,input:${namespace}`,
          `type:namespaceSample,namespace:${namespace}`,
        ]) {
          expect(actions.slice(0, 6)).toContainEqual({
            type: "IS_LOADING",
            isLoading,
            key: `updateNamespace::${environment}::${namespace}::${query}`,
          });
        }
      }

      expect(actions[6]).toEqual({
        type: "SET_RECIPES",
        namespace,
        environment,
        recipes,
      });
    });
  });

  describe("updateNamespaceNames", () => {
    it("should update namespaces", async () => {
      const namespace = faker.lorem.slug(2);
      const normandyApi = new NormandyAPI(ENVIRONMENTS.local);
      const environment: string = normandyApi.environment.key;
      const recipes = recipeFactory.buildCount(3, {
        latest_revision: {
          filter_object: [
            filterObjectFactory.build({
              type: "namespaceSample",
              namespace,
            }),
          ],
        },
      });

      // This is not actually a very good mock, because it doesn't filter the
      // recipes at all. However the code being tested should be robust to
      // recipes showing up in multiple queries anyways.
      const fetchRecipesDeferred = new Deferred<Array<RecipeV3>>();
      jest
        .spyOn(normandyApi, "fetchAllRecipes")
        .mockReturnValue(fetchRecipesDeferred.promise);
      const provider = new NamespacesProvider({ normandyApi });
      const actions = [];
      jest.spyOn(provider, "dispatch").mockImplementation(function (action) {
        actions.push(action);
        return this.setState((oldState) => reducer(oldState, action));
      });

      const updateNamespaceNamesPromise = provider.updateNamespaceNames();

      expect(actions).toHaveLength(3);
      expect(
        actions.every(
          (action) => action.type === "IS_LOADING" && action.isLoading,
        ),
      ).toBeTruthy;

      fetchRecipesDeferred.resolve(recipes);
      await fetchRecipesDeferred.promise;

      expect(
        actions
          .slice(3, 6)
          .every((action) => action.type === "IS_LOADING" && !action.isLoading),
      ).toBeTruthy;

      await updateNamespaceNamesPromise;

      expect(actions).toHaveLength(7);
      expect(actions[6]).toEqual({
        type: "ADD_NAMESPACES",
        environment,
        namespaces: new Set([namespace]),
      });
    });
  });
});
