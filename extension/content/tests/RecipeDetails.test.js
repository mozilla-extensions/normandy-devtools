import { render, cleanup, waitFor, fireEvent } from "@testing-library/react";
import React from "react";

import "@testing-library/jest-dom/extend-expect";
import App from "devtools/components/App";
import NormandyAPI from "devtools/utils/normandyApi";

import {
  versionFoFactory,
  channelFoFactory,
  countryFoFactory,
  localeFoFactory,
  bucketSampleFoFactory,
  stableSampleFoFactory,
} from "./factories/filterObjects";
import {
  recipeFactory,
  addonStudyBranchFactory,
  multiPrefBranchFactory,
  approvalRequestFactory,
} from "./factories/recipes";

describe("The `RecipeDetailForm` component", () => {
  afterEach(async () => {
    jest.clearAllMocks();
    await cleanup();
  });

  const setup = (recipe) => {
    const pageResponse = { results: [recipe] };
    jest
      .spyOn(NormandyAPI.prototype, "fetchRecipePage")
      .mockImplementation(() => Promise.resolve(pageResponse));

    jest
      .spyOn(NormandyAPI.prototype, "fetchRecipe")
      .mockImplementation(() => Promise.resolve(recipe));
  };

  /** @return {import("devtools/types/recipes").RecipeV3<import("devtools/types/arguments").BranchedAddonStudyArguments>} */
  const branchedAddonSetup = () => {
    const versions = versionFoFactory.build({}, { generateVersionsCount: 2 });
    const channels = channelFoFactory.build({}, { generateChannelsCount: 1 });
    const countries = countryFoFactory.build({}, { generateCountriesCount: 2 });
    const locales = localeFoFactory.build({}, { generateLocalesCount: 2 });
    const sample = bucketSampleFoFactory.build();
    const extraFO = { type: "unknown", unknowns: ["something unknown"] };

    /** @type Array<import("devtools/types/filters").FilterObject> */
    const filter_object = [
      versions,
      channels,
      countries,
      locales,
      sample,
      extraFO,
    ];
    const branches = addonStudyBranchFactory.buildCount(2);
    const recipe = recipeFactory.build(
      {
        latest_revision: {
          action: { name: "branched-addon-study" },
          filter_object,
          arguments: { branches },
        },
      },
      {},
    );
    return /** @type import("devtools/types/recipes").RecipeV3<import("devtools/types/arguments").BranchedAddonStudyArguments> */ (recipe);
  };

  const multiprefRecipeSetUp = () => {
    const sample = stableSampleFoFactory.build();
    const versions = versionFoFactory.build({}, { generateVersionsCount: 2 });
    const branches = multiPrefBranchFactory.buildMany(
      [{}, {}],
      [{ generatePreferenceCount: 2 }, { generatePreferenceCount: 3 }],
    );
    const recipe = recipeFactory.build({
      latest_revision: {
        action: { name: "multi-preference-experiment" },
        filter_object: [versions, sample],
        arguments: { branches },
      },
    });

    return recipe;
  };

  const unapproveRecipe = (recipe) => {
    const approvalRequest = approvalRequestFactory.build({}, { empty: true });
    recipe.latest_revision = {
      ...recipe.latest_revision,
      approval_request: approvalRequest,
    };
    return recipe;
  };

  const findFOValue = (filterObject, type, value) => {
    const fo = filterObject.find((obj) => obj.type === type);
    return fo[value];
  };

  it("displays details of an branchedAddon recipe", async () => {
    const recipeData = branchedAddonSetup();
    setup(recipeData);
    const { getByText, getAllByText } = await render(<App />);
    fireEvent.click(getByText(recipeData.latest_revision.name));

    await waitFor(() => expect(NormandyAPI.prototype.fetchRecipe).toReturn());
    expect(getByText("Action")).toBeInTheDocument();

    expect(getByText("branched-addon-study")).toBeInTheDocument();
    const { latest_revision } = recipeData;
    const { filter_object, arguments: recipe_args } = latest_revision;

    expect(getAllByText(recipe_args.userFacingName)).not.toHaveLength(0);
    expect(getAllByText(recipe_args.userFacingDescription)).not.toHaveLength(0);
    expect(getAllByText(recipe_args.slug)).not.toHaveLength(0);
    expect(
      getAllByText(latest_revision.extra_filter_expression),
    ).not.toHaveLength(0);

    const channels = findFOValue(filter_object, "channel", "channels");
    for (const channel of channels) {
      expect(getAllByText(channel)).not.toHaveLength(0);
    }

    const versions = findFOValue(filter_object, "version", "versions");
    for (const version of versions) {
      expect(getAllByText(version.toString())).not.toHaveLength(0);
    }

    const { branches } = recipe_args;
    for (const branch of branches) {
      expect(getAllByText(branch.slug)).not.toHaveLength(0);
      expect(getAllByText(branch.extensionApiId.toString())).not.toHaveLength(
        0,
      );
      expect(getAllByText(branch.ratio.toString())).not.toHaveLength(0);
    }
  });

  it("should be able approve recipes", async () => {
    jest
      .spyOn(NormandyAPI.prototype, "approveApprovalRequest")
      .mockImplementation(() => Promise.resolve({}));

    let recipeData = multiprefRecipeSetUp();
    recipeData = unapproveRecipe(recipeData);
    setup(recipeData);
    const { getByText } = await render(<App />);
    fireEvent.click(getByText("Recipes"));

    await waitFor(() =>
      expect(getByText(recipeData.latest_revision.name)).toBeInTheDocument(),
    );
    fireEvent.click(getByText(recipeData.latest_revision.name));

    await waitFor(() => expect(NormandyAPI.prototype.fetchRecipe).toReturn());
    expect(getByText("Approval Request")).toBeInTheDocument();

    const expandApproval = document.querySelector(
      ".rs-btn.rs-btn-subtle.rs-btn-icon.rs-btn-icon-placement-left.rs-btn-xs",
    );
    fireEvent.click(expandApproval);
    expect(getByText("Comment:")).toBeInTheDocument();

    const comment = document.querySelector("input");

    fireEvent.change(comment, { target: { value: "r+" } });

    fireEvent.click(getByText("Approve"));

    expect(NormandyAPI.prototype.approveApprovalRequest).toBeCalled();
  });

  it("should be able reject recipes", async () => {
    jest
      .spyOn(NormandyAPI.prototype, "rejectApprovalRequest")
      .mockImplementation(() => Promise.resolve({}));

    let recipeData = multiprefRecipeSetUp();
    recipeData = unapproveRecipe(recipeData);
    setup(recipeData);
    const { getByText, findByText } = await render(<App />);
    fireEvent.click(getByText("Recipes"));

    fireEvent.click(await findByText(recipeData.latest_revision.name));

    await waitFor(() => expect(NormandyAPI.prototype.fetchRecipe).toReturn());
    expect(getByText("Approval Request")).toBeInTheDocument();

    const expandApproval = document.querySelector(
      ".rs-btn.rs-btn-subtle.rs-btn-icon.rs-btn-icon-placement-left.rs-btn-xs",
    );
    fireEvent.click(expandApproval);
    expect(getByText("Comment:")).toBeInTheDocument();

    const comment = document.querySelector("input");

    fireEvent.change(comment, { target: { value: "Rejected" } });

    fireEvent.click(getByText("Reject"));

    expect(NormandyAPI.prototype.rejectApprovalRequest).toBeCalled();
  });

  it("should be able cancel approval requests recipes", async () => {
    jest
      .spyOn(NormandyAPI.prototype, "closeApprovalRequest")
      .mockImplementation(() => Promise.resolve({}));

    let recipeData = multiprefRecipeSetUp();
    recipeData = unapproveRecipe(recipeData);
    setup(recipeData);
    const { getByText } = await render(<App />);
    fireEvent.click(getByText("Recipes"));

    await waitFor(() =>
      expect(getByText(recipeData.latest_revision.name)).toBeInTheDocument(),
    );
    fireEvent.click(getByText(recipeData.latest_revision.name));

    await waitFor(() => expect(NormandyAPI.prototype.fetchRecipe).toReturn());
    expect(getByText("Approval Request")).toBeInTheDocument();

    const expandApproval = document.querySelector(
      ".rs-btn.rs-btn-subtle.rs-btn-icon.rs-btn-icon-placement-left.rs-btn-xs",
    );
    fireEvent.click(expandApproval);
    expect(getByText("Comment:")).toBeInTheDocument();

    fireEvent.click(getByText("Cancel Request"));

    expect(NormandyAPI.prototype.closeApprovalRequest).toBeCalled();
  });
});
