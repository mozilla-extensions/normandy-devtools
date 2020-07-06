import { render, cleanup, waitFor, fireEvent } from "@testing-library/react";
import React from "react";

import "@testing-library/jest-dom/extend-expect";
import App from "devtools/components/App";
import NormandyAPI from "devtools/utils/normandyApi";

import {
  VersionFilterObjectFactory,
  ChannelFilterObjectFactory,
  BucketSampleFilterObjectFactory,
  StableSampleFilterObjectFactory,
  LocaleFilterObjectFactory,
  CountryFilterObjectFactory,
} from "./factories/filterObjectFactory";
import {
  AddOnBranchFactory,
  ApprovalRequestFactory,
  MultiPrefBranchFactory,
  MultiPreferenceFactory,
  RecipeFactory,
} from "./factories/recipeFactory";

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

  const branchedAddonSetup = () => {
    const versions = VersionFilterObjectFactory.build(
      {},
      { generateVersionsCount: 2 },
    );
    const channels = ChannelFilterObjectFactory.build(
      {},
      { generateChannelsCount: 1 },
    );
    const countries = CountryFilterObjectFactory.build(
      {},
      { generateCountriesCount: 2 },
    );
    const locales = LocaleFilterObjectFactory.build(
      {},
      { generateLocalesCount: 2 },
    );
    const sample = BucketSampleFilterObjectFactory.build();
    const extraFO = { type: "unknown", unknowns: ["something unknown"] };

    const filterObject = [
      versions,
      channels,
      countries,
      locales,
      sample,
      extraFO,
    ];
    const branch1 = AddOnBranchFactory.build();
    const branch2 = AddOnBranchFactory.build();
    const recipe = RecipeFactory.build(
      {},
      {
        actionName: "branched-addon-study",
        filterObject,
      },
    );
    recipe.latest_revision.arguments = {
      ...recipe.latest_revision.arguments,
      branches: [branch1, branch2],
    };
    return recipe;
  };

  const multiprefRecipeSetUp = () => {
    const sample = StableSampleFilterObjectFactory.build();
    const versions = VersionFilterObjectFactory.build(
      {},
      { generateVersionsCount: 2 },
    );
    const recipe = RecipeFactory.build(
      {},
      {
        actionName: "multi-preference-experiment",
        filterObject: [versions, sample],
      },
    );
    const branch1 = MultiPrefBranchFactory.build(
      {},
      { generatePreferenceCount: 2 },
    );
    const branch2 = MultiPrefBranchFactory.build(
      {},
      { generatePreferenceCount: 3 },
    );

    const branches = [branch1, branch2];
    const multiPrefArguments = MultiPreferenceFactory.build({ branches });
    recipe.latest_revision = {
      ...recipe.latest_revision,
      arguments: multiPrefArguments,
    };

    return recipe;
  };

  const unapproveRecipe = (recipe) => {
    const approvalRequest = ApprovalRequestFactory.build({}, { empty: true });
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
    const { getByText } = await render(<App />);
    fireEvent.click(getByText("View Recipe"));

    await waitFor(() => expect(NormandyAPI.prototype.fetchRecipe).toReturn());
    expect(getByText("Action")).toBeInTheDocument();

    expect(getByText("branched-addon-study")).toBeInTheDocument();
    const { latest_revision } = recipeData;
    const { filter_object, arguments: recipe_args } = latest_revision;

    expect(getByText(recipe_args.userFacingName)).toBeInTheDocument();
    expect(getByText(recipe_args.userFacingDescription)).toBeInTheDocument();
    expect(getByText(recipe_args.slug)).toBeInTheDocument();
    expect(
      getByText(latest_revision.extra_filter_expression),
    ).toBeInTheDocument();

    const channels = findFOValue(filter_object, "channel", "channels");
    for (const channel of channels) {
      expect(getByText(channel)).toBeInTheDocument();
    }

    const versions = findFOValue(filter_object, "version", "versions");
    for (const version of versions) {
      expect(getByText(version.toString())).toBeInTheDocument();
    }

    const { branches } = recipe_args;
    for (const branch of branches) {
      expect(getByText(branch.slug)).toBeInTheDocument();
      expect(getByText(branch.extensionApiId.toString())).toBeInTheDocument();
      expect(getByText(branch.ratio.toString())).toBeInTheDocument();
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

    await waitFor(() => expect(getByText("View Recipe")).toBeInTheDocument());
    fireEvent.click(getByText("View Recipe"));

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
    const { getByText } = await render(<App />);
    fireEvent.click(getByText("Recipes"));

    await waitFor(() => expect(getByText("View Recipe")).toBeInTheDocument());
    fireEvent.click(getByText("View Recipe"));

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

    await waitFor(() => expect(getByText("View Recipe")).toBeInTheDocument());
    fireEvent.click(getByText("View Recipe"));

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
