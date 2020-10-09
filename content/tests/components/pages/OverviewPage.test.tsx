import { cleanup, waitForElementToBeRemoved } from "@testing-library/react";
import React from "react";

import { OverviewPage } from "devtools/components/pages/OverviewPage";
import {
  recipeFactory,
  approvalRequestFactory,
} from "devtools/tests/factories/recipes";
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

    const { getByText } = renderWithContext(<OverviewPage />);
    await waitForElementToBeRemoved(getByText(/Loading Overview/));

    expect(NormandyAPI.prototype.fetchRecipe).toBeCalledTimes(1);
    expect(getByText(recipe.id.toString())).toBeInTheDocument();
  });
});
