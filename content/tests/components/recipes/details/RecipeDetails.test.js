import { render, cleanup, waitFor, fireEvent } from "@testing-library/react";
import React from "react";

import "@testing-library/jest-dom/extend-expect";
import App from "devtools/components/App";
import { experimenterResponseFactory } from "devtools/tests/factories/experiments";
import {
  versionFoFactory,
  channelFoFactory,
  countryFoFactory,
  localeFoFactory,
  bucketSampleFoFactory,
  stableSampleFoFactory,
} from "devtools/tests/factories/filterObjects";
import {
  recipeFactory,
  addonStudyBranchFactory,
  multiPrefBranchFactory,
  approvalRequestFactory,
} from "devtools/tests/factories/recipes";
import ExperimenterAPI from "devtools/utils/experimenterApi";
import { Deferred } from "devtools/utils/helpers";
import NormandyAPI from "devtools/utils/normandyApi";

describe("The `RecipeDetails` component", () => {
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

  const experimenterSetup = (experiment) => {
    if (!experiment) {
      experiment = experimenterResponseFactory.build();
    }

    jest
      .spyOn(ExperimenterAPI.prototype, "fetchExperiment")
      .mockImplementation(() => Promise.resolve(experiment));
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
    experimenterSetup();
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

  it("displays details from experimenter", async () => {
    const recipeData = branchedAddonSetup();
    setup(recipeData);
    const experiment = experimenterResponseFactory.build(
      {
        proposed_start_date: new Date(2020, 3, 3, 1, 0).getTime(),
        proposed_duration: 10,
      },
      { generateVariantsCount: 2 },
    );
    experimenterSetup(experiment);

    const { getByText, findByText, findByTestId } = await render(<App />);
    fireEvent.click(getByText("Recipes"));
    fireEvent.click(await findByText(recipeData.latest_revision.name));

    await waitFor(() =>
      expect(ExperimenterAPI.prototype.fetchExperiment).toReturn(),
    );
    await waitFor(() => expect(NormandyAPI.prototype.fetchRecipe).toReturn());

    expect(getByText("Experimenter Details")).toBeInTheDocument();
    expect(await findByText(experiment.public_description)).toBeInTheDocument();
    expect(getByText(experiment.variants[0].description)).toBeInTheDocument();
    expect(getByText(experiment.variants[1].description)).toBeInTheDocument();

    const eltProposedSchedule = await findByTestId("details-proposed-schedule");
    const proposedSchedule = eltProposedSchedule.querySelector("p").innerHTML;
    expect(proposedSchedule).toEqual(
      "Fri Apr 03 2020 → Mon Apr 13 2020 (10 days)",
    );
  });

  it("should be able approve recipes", async () => {
    jest
      .spyOn(NormandyAPI.prototype, "approveApprovalRequest")
      .mockImplementation(() => Promise.resolve({}));

    let recipeData = multiprefRecipeSetUp();
    recipeData = unapproveRecipe(recipeData);
    setup(recipeData);
    const { getByText, findByTestId } = await render(<App />);
    fireEvent.click(getByText("Recipes"));

    await waitFor(() =>
      expect(getByText(recipeData.latest_revision.name)).toBeInTheDocument(),
    );
    fireEvent.click(getByText(recipeData.latest_revision.name));

    await waitFor(() => expect(NormandyAPI.prototype.fetchRecipe).toReturn());
    expect(getByText("Approval Request")).toBeInTheDocument();

    const expandApproval = await findByTestId("collapse-approval-request");
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
    const { getByText, findByText, findByTestId } = await render(<App />);
    fireEvent.click(getByText("Recipes"));

    fireEvent.click(await findByText(recipeData.latest_revision.name));

    await waitFor(() => expect(NormandyAPI.prototype.fetchRecipe).toReturn());
    expect(getByText("Approval Request")).toBeInTheDocument();

    const expandApproval = await findByTestId("collapse-approval-request");
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
    const { getByText, findByTestId } = await render(<App />);
    fireEvent.click(getByText("Recipes"));

    await waitFor(() =>
      expect(getByText(recipeData.latest_revision.name)).toBeInTheDocument(),
    );
    fireEvent.click(getByText(recipeData.latest_revision.name));

    await waitFor(() => expect(NormandyAPI.prototype.fetchRecipe).toReturn());
    expect(getByText("Approval Request")).toBeInTheDocument();

    const expandApproval = await findByTestId("collapse-approval-request");
    fireEvent.click(expandApproval);
    expect(getByText("Comment:")).toBeInTheDocument();

    fireEvent.click(getByText("Cancel Request"));

    expect(NormandyAPI.prototype.closeApprovalRequest).toBeCalled();
  });

  it("should be able to pause recipes", async () => {
    const nextRevisionId = 10042;
    const patchRecipeDeferred = new Deferred();
    jest
      .spyOn(NormandyAPI.prototype, "patchRecipe")
      .mockImplementation(() => patchRecipeDeferred.promise);
    const requestApprovalDeferred = new Deferred();
    jest
      .spyOn(NormandyAPI.prototype, "requestApproval")
      .mockImplementation(async () => approvalRequestFactory.build());

    const recipe = recipeFactory.build({
      latest_revision: {
        action: { name: "multi-preference-experiment" },
        arguments: { isEnrollmentPaused: false },
      },
    });
    setup(recipe);

    const doc = await render(<App />);

    // Navigate to the detail page
    fireEvent.click(doc.getByText("Recipes"));
    fireEvent.click(await doc.findByText(recipe.latest_revision.name));

    // wait for load to complete
    await doc.findByText(recipe.latest_revision.name);

    // The pause button should be available
    const pauseButton = await doc.findByText("Pause");
    expect(pauseButton).toBeInTheDocument();
    expect(pauseButton).not.toHaveAttribute("disabled");

    // Click the pause button, which should disable while the requests are in flight.
    fireEvent.click(pauseButton);
    expect(pauseButton).toHaveAttribute("disabled");

    // A request to pause the recipe is sent
    expect(NormandyAPI.prototype.patchRecipe).toBeCalledWith(recipe.id, {
      comment: expect.any(String),
      arguments: {
        ...recipe.latest_revision.arguments,
        isEnrollmentPaused: true,
      },
    });

    // After the pause completes, an approval recipe should be sent
    patchRecipeDeferred.resolve({ latest_revision: { id: nextRevisionId } });
    await Promise.resolve();
    expect(NormandyAPI.prototype.requestApproval).toBeCalledWith(
      nextRevisionId,
    );

    // The button should still be visible, but disabled
    expect(pauseButton).toHaveAttribute("disabled");

    // After the request completes, the pause button should go away, since the recipe isn't pausable anymore
    requestApprovalDeferred.resolve(approvalRequestFactory.build());
    await waitFor(() => expect(pauseButton).not.toBeInTheDocument());
  });

  it("shouldn't show the pause button on recipes that can't be paused", async () => {
    const recipe = recipeFactory.build({
      latest_revision: {
        // Heartbeat recipes aren't pausable, and so shouldn't trigger the UI
        action: { name: "show-heartbeat" },
      },
    });
    setup(recipe);

    const doc = await render(<App />);

    // Navigate to the detail page
    fireEvent.click(doc.getByText("Recipes"));
    fireEvent.click(await doc.findByText(recipe.latest_revision.name));

    // wait for load to complete
    await doc.findByText(recipe.latest_revision.name);

    expect(doc.queryAllByText("Pause")).toHaveLength(0);
  });

  it("shouldn't show the pause button on already paused recipes", async () => {
    const recipe = recipeFactory.build({
      latest_revision: {
        action: { name: "multi-preference-experiment" },
        arguments: { isEnrollmentPaused: true },
      },
    });
    setup(recipe);

    const doc = await render(<App />);

    // Navigate to the detail page
    fireEvent.click(doc.getByText("Recipes"));
    fireEvent.click(await doc.findByText(recipe.latest_revision.name));

    // wait for load to complete
    await doc.findByText(recipe.latest_revision.name);

    expect(doc.queryAllByText("Pause")).toHaveLength(0);
  });
});
