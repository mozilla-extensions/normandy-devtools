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
import ExperimenterAPI from "devtools/utils/experimenterApi";
import NormandyAPI from "devtools/utils/normandyApi";

afterEach(async () => {
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
      { latest_revision: { enabled: true } },
      { latest_revision: { enabled: true } },
      { latest_revision: { enabled: false } },
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

    const disabledButton = document.querySelectorAll("button");

    expect(disabledButton[2]).toBeDisabled();

    fireEvent.click(disabledButton[0]);

    expect(NormandyAPI.prototype.disableRecipe).toBeCalled();
  });
});
