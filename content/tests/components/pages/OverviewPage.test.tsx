import {
  cleanup,
  fireEvent,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import React from "react";

import { OverviewPage } from "devtools/components/pages/OverviewPage";
import { experimenterResponseFactory } from "devtools/tests/factories/experiments";
import {
  recipeFactory,
  approvalRequestFactory,
} from "devtools/tests/factories/recipes";
import { RecipeV3 } from "devtools/types/recipes";
import ExperimenterAPI from "devtools/utils/experimenterApi";
import NormandyAPI from "devtools/utils/normandyApi";

beforeEach(() => {
  restoreConsole();
});

afterEach(async () => {
  modifyConsole();
  jest.clearAllMocks();
  await cleanup();
});

describe("OverviewPage", () => {
  it("should display pending review recipes", async () => {
    const recipe = recipeFactory.build({
      latest_revision: {
        approval_request: {
          approved: null,
        },
      },
    });

    const pendingApprovalRequest = approvalRequestFactory.build({
      approved: null,
      revision: { recipe_id: recipe.id },
    });

    jest
      .spyOn(NormandyAPI.prototype, "fetchApprovalRequests")
      .mockImplementation(() => Promise.resolve([pendingApprovalRequest]));
    jest
      .spyOn(NormandyAPI.prototype, "fetchRecipe")
      .mockImplementation(() => Promise.resolve(recipe));

    jest
      .spyOn(ExperimenterAPI.prototype, "fetchExperiments")
      .mockImplementation(() => Promise.resolve([]));

    const doc = renderWithContext(<OverviewPage />);
    await waitForElementToBeRemoved(doc.getByText(/Loading Overview/));

    expect(NormandyAPI.prototype.fetchRecipe).toBeCalledTimes(1);
    expect(doc.getByText(recipe.id.toString())).toBeInTheDocument();
  });

  it("should display overdue recipes", async () => {
    const recipes = recipeFactory.buildMany([
      {
        latest_revision: { enabled: true },
        approved_revision: { enabled: true },
      },
      {
        latest_revision: { enabled: true },
        approved_revision: { enabled: true },
      },
      {
        latest_revision: { enabled: false },
        approved_revision: { enabled: false },
      },
    ]);

    const experiments = experimenterResponseFactory.buildMany(
      recipes.map((r) => ({ normandy_id: r.id })),
    );

    jest
      .spyOn(NormandyAPI.prototype, "fetchApprovalRequests")
      .mockImplementation(() => Promise.resolve([]));
    jest
      .spyOn(NormandyAPI.prototype, "fetchRecipe")
      .mockReturnValueOnce(Promise.resolve(recipes[0]))
      .mockReturnValueOnce(Promise.resolve(recipes[1]))
      .mockReturnValueOnce(Promise.resolve(recipes[2]));

    jest
      .spyOn(ExperimenterAPI.prototype, "fetchExperiments")
      .mockImplementation(() => Promise.resolve(experiments));

    jest.spyOn(NormandyAPI.prototype, "disableRecipe");

    const doc = renderWithContext(<OverviewPage />);
    await waitForElementToBeRemoved(doc.getByText(/Loading Overview/));

    expect(ExperimenterAPI.prototype.fetchExperiments).toBeCalled();

    expect(doc.getByText(recipes[0].id.toString())).toBeInTheDocument();
    expect(doc.getByText(recipes[0].latest_revision.name)).toBeInTheDocument();

    expect(doc.getByText(recipes[1].id.toString())).toBeInTheDocument();
    expect(doc.getByText(recipes[1].latest_revision.name)).toBeInTheDocument();

    expect(doc.getByText(recipes[2].id.toString())).toBeInTheDocument();
    expect(doc.getByText(recipes[2].latest_revision.name)).toBeInTheDocument();

    const disabledButtons = await doc.findAllByText("Disable");

    expect(disabledButtons[2]).toBeDisabled();

    expect(disabledButtons[0]).toBeEnabled();
  });

  it("should display need to pause recipes", async () => {
    const recipes = recipeFactory.buildMany([
      {
        latest_revision: {
          action: { name: "multi-preference-experiment" },
          arguments: { isEnrollmentPaused: false },
        },
      },
      {
        latest_revision: {
          action: { name: "multi-preference-experiment" },
          arguments: { isEnrollmentPaused: false },
        },
      },
      {
        latest_revision: {
          action: { name: "multi-preference-experiment" },
          arguments: { isEnrollmentPaused: true },
        },
      },
    ]);
    const enrollmentPaused = [10000, 2, 5];
    const hundredDaysFuture = new Date();
    hundredDaysFuture.setDate(hundredDaysFuture.getDate() + 100);
    const experiments = experimenterResponseFactory.buildMany(
      recipes.map((r, i) => ({
        normandy_id: r.id,
        proposed_enrollment: enrollmentPaused[i],
        end_date: hundredDaysFuture.getTime(),
      })),
    );
    jest
      .spyOn(NormandyAPI.prototype, "fetchApprovalRequests")
      .mockImplementation(() => Promise.resolve([]));

    const mockFetchRecipe = jest
      .fn()
      .mockImplementation((i): RecipeV3 => recipes[i % 3]);

    jest
      .spyOn(NormandyAPI.prototype, "fetchRecipe")
      .mockImplementation(() =>
        Promise.resolve(mockFetchRecipe(mockFetchRecipe.mock.calls.length)),
      );

    jest
      .spyOn(ExperimenterAPI.prototype, "fetchExperiments")
      .mockImplementation(() => Promise.resolve(experiments));

    jest
      .spyOn(NormandyAPI.prototype, "patchRecipe")
      .mockImplementation(() => Promise.resolve(recipes[1]));

    const doc = renderWithContext(<OverviewPage />);
    await waitForElementToBeRemoved(doc.getByText(/Loading Overview/));

    expect(ExperimenterAPI.prototype.fetchExperiments).toBeCalled();

    expect(doc.queryByText(recipes[0].id.toString())).not.toBeInTheDocument();
    expect(
      doc.queryByText(recipes[0].latest_revision.name),
    ).not.toBeInTheDocument();

    expect(doc.getByText(recipes[1].id.toString())).toBeInTheDocument();
    expect(doc.getByText(recipes[1].latest_revision.name)).toBeInTheDocument();

    expect(doc.queryByText(recipes[2].id.toString())).not.toBeInTheDocument();
    expect(
      doc.queryByText(recipes[2].latest_revision.name),
    ).not.toBeInTheDocument();
  });

  it("should allow calls to patchRecipe for pauses", async () => {
    const recipe = recipeFactory.build();
    const experiment = experimenterResponseFactory.build({
      normandy_id: recipe.id,
      proposed_enrollment: 2,
    });
    jest
      .spyOn(NormandyAPI.prototype, "fetchApprovalRequests")
      .mockImplementation(() => Promise.resolve([]));

    jest
      .spyOn(NormandyAPI.prototype, "fetchRecipe")
      .mockImplementation(() => Promise.resolve(recipe));

    jest
      .spyOn(ExperimenterAPI.prototype, "fetchExperiments")
      .mockImplementation(() => Promise.resolve([experiment]));

    jest
      .spyOn(NormandyAPI.prototype, "patchRecipe")
      .mockImplementation(() => Promise.resolve(recipe));

    const doc = renderWithContext(<OverviewPage />);
    await waitForElementToBeRemoved(doc.getByText(/Loading Overview/));

    fireEvent.click(doc.getByText("Pause"));

    expect(NormandyAPI.prototype.patchRecipe).toBeCalledWith(recipe.id, {
      comment: "One-click pause",
      arguments: {
        ...recipe.latest_revision.arguments,
        isEnrollmentPaused: true,
      },
    });
  });
});
