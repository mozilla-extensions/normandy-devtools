import { cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import faker from "faker";
import _ from "lodash";
import React from "react";

import NamespacesPage, {
  categorizeRecipes,
} from "devtools/components/pages/NamespacesPage";
import { NAMESPACES } from "devtools/config";
import { filterObjectFactory } from "devtools/tests/factories/filterObjects";
import { recipeFactory } from "devtools/tests/factories/recipes";
import { RecipeV3 } from "devtools/types/recipes";
import { Deferred } from "devtools/utils/helpers";
import NormandyAPI from "devtools/utils/normandyApi";
import * as recipesUtils from "devtools/utils/recipes";

afterEach(() => {
  jest.restoreAllMocks();
  cleanup();
});

describe("NamespacePage", () => {
  const defaultNamespace = faker.lorem.slug(2);
  let originalDefaultNamespace;

  beforeAll(() => {
    originalDefaultNamespace = NAMESPACES.default;
    NAMESPACES.default = defaultNamespace;
    restoreConsole();
  });

  afterAll(() => {
    NAMESPACES.default = originalDefaultNamespace;
    modifyConsole();
  });

  it("should show recipes", async () => {
    const filter_objects = filterObjectFactory.buildCount(9, {
      type: "namespaceSample",
      namespace: defaultNamespace,
    });
    const recipes = filter_objects.map((fo) =>
      recipeFactory.build({ latest_revision: { filter_object: [fo] } }),
    );
    // This mock does not mimic the filtering features of the original, which is
    // fine for this test. Since everything should be robust to recipes occurring
    // multiple times.
    jest
      .spyOn(NormandyAPI.prototype, "fetchAllRecipes")
      .mockResolvedValue(recipes);

    const doc = renderWithContext(<NamespacesPage />);
    for (const recipe of recipes) {
      expect(
        await doc.findByText(recipe.latest_revision.name),
      ).toBeInTheDocument();
    }
  });

  it("should allow choosing namespaces", async () => {
    const namespace1 = defaultNamespace;
    const namespace2 = faker.lorem.slug(2);
    const filter_objects1 = filterObjectFactory.buildCount(4, {
      type: "namespaceSample",
      namespace: namespace1,
    });
    const filter_objects2 = filterObjectFactory.buildCount(4, {
      type: "namespaceSample",
      namespace: namespace2,
    });

    const recipes1 = filter_objects1.map((fo) =>
      recipeFactory.build({ latest_revision: { filter_object: [fo] } }),
    );
    const recipes2 = filter_objects2.map((fo) =>
      recipeFactory.build({ latest_revision: { filter_object: [fo] } }),
    );

    jest
      .spyOn(NormandyAPI.prototype, "fetchAllRecipes")
      .mockImplementation(
        async ({ filter_object = "", ...otherFilters } = {}) => {
          expect(otherFilters).toEqual({});
          const filters: Record<string, string> = Object.fromEntries(
            filter_object.split(",").map((p) => p.split(":")),
          );

          if (
            filters.type === "bucketSample" ||
            filters.type === "stableSample"
          ) {
            return [];
          } else if (filters.type === "namespaceSample") {
            delete filters.type;
          }

          if (filters.namespace === namespace1) {
            expect(filters).toEqual({ namespace: namespace1 });
            return recipes1;
          } else if (filters.namespace === namespace2) {
            expect(filters).toEqual({ namespace: namespace2 });
            return recipes2;
          }

          expect(filters).toEqual({});
          return recipes1.concat(recipes2);
        },
      );

    const doc = renderWithContext(<NamespacesPage />);
    for (const recipe of recipes1) {
      expect(
        await doc.findByText(recipe.latest_revision.name),
      ).toBeInTheDocument();
    }

    const namespacePicker = doc.getAllByTestId("namespace-picker")[0]; // why is there more than one?
    userEvent.click(namespacePicker);
    await NormandyAPI.prototype.fetchAllRecipes();

    userEvent.click(await doc.findByText(namespace2, { exact: false }));

    for (const recipe of recipes2) {
      expect(
        await doc.findByText(recipe.latest_revision.name),
      ).toBeInTheDocument();
    }

    for (const recipe of recipes1) {
      expect(doc.queryAllByText(recipe.latest_revision.name)).toHaveLength(0);
    }
  });

  it("should separate out forwards, backwards, and error recipes", async () => {
    const filter_objects = filterObjectFactory.buildMany([
      {
        type: "namespaceSample",
        namespace: defaultNamespace,
      },
      {
        type: "bucketSample",
        // backwards
        input: ["normandy.userId", `'${defaultNamespace}'`],
      },
      {
        type: "bucketSample",
        input: ["an error"],
      },
    ]);
    const recipes = filter_objects.map((fo) =>
      recipeFactory.build({ latest_revision: { filter_object: [fo] } }),
    );
    const [recipeOk, recipeBackwards, recipeError] = recipes;
    // This mock does not mimic the filtering features of the original, which is
    // fine for this test. Since everything should be robust to recipes occurring
    // multiple times.
    jest
      .spyOn(NormandyAPI.prototype, "fetchAllRecipes")
      .mockResolvedValue(recipes);

    const doc = renderWithContext(<NamespacesPage />);
    for (const recipe of recipes) {
      expect(
        await doc.findByText(recipe.latest_revision.name),
      ).toBeInTheDocument();
    }

    const backwardsInputsHeader = doc.getByText(
      "Recipes with Backwards Inputs",
    );
    const errorsHeader = doc.getByText("Recipes with Incorrect Filters");
    expect(backwardsInputsHeader).toBeInTheDocument();
    expect(errorsHeader).toBeInTheDocument();

    // Look for the (fairly rigid) expected structure, so we can make sure that specific recipes show up in specific sections.
    expect(doc.container.childElementCount).toEqual(1);
    expect(doc.container.children[0].childElementCount).toEqual(8);
    const [
      filteringEl,
      okRecipesEl,
      backwardsHeaderEl,
      backwardsParagraphEl,
      backwardsRecipesEl,
      errorHeaderEl,
      errorParagraphEl,
      errorRecipesEl,
    ] = Array.from(doc.container.children[0].children) as Array<HTMLElement>;
    expect(filteringEl.tagName).toEqual("DIV");
    expect(okRecipesEl.tagName).toEqual("DIV");
    expect(backwardsHeaderEl.tagName).toEqual("H3");
    expect(backwardsParagraphEl.tagName).toEqual("P");
    expect(backwardsRecipesEl.tagName).toEqual("DIV");
    expect(errorHeaderEl.tagName).toEqual("H3");
    expect(errorParagraphEl.tagName).toEqual("P");
    expect(errorRecipesEl.tagName).toEqual("DIV");

    expect(
      within(okRecipesEl).getByText(recipeOk.latest_revision.name),
    ).toBeInTheDocument();
    expect(
      within(backwardsRecipesEl).getByText(
        recipeBackwards.latest_revision.name,
      ),
    ).toBeInTheDocument();
    expect(
      within(errorRecipesEl).getByText(recipeError.latest_revision.name),
    ).toBeInTheDocument();
  });

  it("should show a placeholder while it is loading", async () => {
    const recipeDeferred = new Deferred<Array<RecipeV3>>();
    jest
      .spyOn(NormandyAPI.prototype, "fetchAllRecipes")
      .mockReturnValue(recipeDeferred.promise);

    const doc = renderWithContext(<NamespacesPage />);
    expect(doc.queryAllByTestId("recipe-card-placeholder")).not.toHaveLength(0);
  });
});

describe("categorizeRecipes", () => {
  it("should categorize recipes that have no problems", () => {
    const namespace = faker.lorem.slug(2);
    const filter_objects = filterObjectFactory.buildMany([
      {
        type: "stableSample",
        input: [`"${namespace}"`, "normandy.userId"],
        rate: 0.1,
      },
      {
        type: "bucketSample",
        input: [`"${namespace}"`, "normandy.userId"],
        start: 1000,
        count: 2000,
      },
      {
        type: "namespaceSample",
        namespace,
        start: 3000,
        count: 4000,
      },
    ]);
    const recipes = filter_objects.map((fo) =>
      recipeFactory.build({ latest_revision: { filter_object: [fo] } }),
    );

    const categorized = categorizeRecipes(recipes);
    expect(categorized).toEqual({
      ok: [
        {
          bucketRange: [0, 1000],
          recipe: recipes[0],
        },
        {
          bucketRange: [1000, 3000],
          recipe: recipes[1],
        },
        {
          bucketRange: [3000, 7000],
          recipe: recipes[2],
        },
      ],
      error: [],
      backwards: [],
    });
  });

  it("should categorize recipes that have 'backwards' inputs", () => {
    const namespace = faker.lorem.slug(2);
    const filter_objects = filterObjectFactory.buildMany([
      {
        type: "stableSample",
        input: ["normandy.userId", `"${namespace}"`],
        rate: 0.1,
      },
      {
        type: "bucketSample",
        input: ["normandy.userId", `"${namespace}"`],
        start: 1000,
        count: 2000,
      },
    ]);
    const recipes = filter_objects.map((fo) =>
      recipeFactory.build({ latest_revision: { filter_object: [fo] } }),
    );

    const categorized = categorizeRecipes(recipes);
    expect(categorized).toEqual({
      backwards: [
        {
          bucketRange: [0, 1000],
          recipe: recipes[0],
        },
        {
          bucketRange: [1000, 3000],
          recipe: recipes[1],
        },
      ],
      error: [],
      ok: [],
    });
  });

  it("should categorize recipes that have filters that can't be processed", async () => {
    const expectedError = new Error("expected test error");

    const originalFunc = recipesUtils.getSamplingFilterAsNamespaceSample;
    const getNamespaceSampleFilterSpy = jest
      .spyOn(recipesUtils, "getSamplingFilterAsNamespaceSample")
      .mockImplementation(() => {
        throw expectedError;
      });
    for (const [key, val] of Object.entries(originalFunc)) {
      if (key.endsWith("Error")) {
        getNamespaceSampleFilterSpy[key] = val;
      }
    }

    const recipes = recipeFactory.buildCount(10);

    const categorized = categorizeRecipes(recipes);
    expect(categorized.ok).toHaveLength(0);
    expect(categorized.backwards).toHaveLength(0);
    expect(categorized.error).toHaveLength(recipes.length);
    expect(
      categorized.error.every(
        ({ recipe, err, bucketRange }, idx) =>
          recipe === recipes[idx] &&
          err === expectedError &&
          bucketRange === null,
      ),
    );
  });

  it("should sort the lists", () => {
    const namespace = faker.lorem.slug(2);
    const ranges = _.shuffle([
      [200, 400],
      [250, 350],
      [100, 200],
      [200, 300],
    ]);
    const recipes = ranges.map(([start, end]) =>
      recipeFactory.build({
        latest_revision: {
          filter_object: [
            filterObjectFactory.build({
              type: "namespaceSample",
              namespace,
              start,
              count: end - start,
            }),
          ],
        },
      }),
    );

    const categorized = categorizeRecipes(recipes);
    expect(categorized.error).toHaveLength(0);
    expect(categorized.backwards).toHaveLength(0);
    expect(categorized.ok).toHaveLength(4);
    expect(categorized.ok.map((v) => v.bucketRange)).toEqual([
      [100, 200],
      [200, 300],
      [200, 400],
      [250, 350],
    ]);
  });
});
