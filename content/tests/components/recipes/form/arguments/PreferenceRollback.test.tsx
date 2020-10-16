import { cleanup, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import PreferenceRollback from "devtools/components/recipes/form/arguments/PreferenceRollback";
import { RecipeDetailsProvider } from "devtools/contexts/recipeDetails";
import { recipeFactory } from "devtools/tests/factories/recipes";
import { PreferenceRolloutArguments } from "devtools/types/arguments";
import { RecipeV3 } from "devtools/types/recipes";
import NormandyAPI from "devtools/utils/normandyApi";

afterEach(async () => {
  jest.clearAllMocks();
  await cleanup();
});

describe("PreferenceRollback", () => {
  it("should list out existing rollouts", async () => {
    const recipe = recipeFactory.build({
      latest_revision: {
        action: { name: "preference-rollout" },
      },
    });

    jest
      .spyOn(NormandyAPI.prototype, "fetchAllRecipes")
      .mockImplementation(() => Promise.resolve([recipe]));

    const doc = renderWithContext(
      <RecipeDetailsProvider data={{ arguments: {} }}>
        <PreferenceRollback />
      </RecipeDetailsProvider>,
    );

    await waitFor(() => {
      expect(NormandyAPI.prototype.fetchAllRecipes).toHaveReturned();
    });

    fireEvent.click(doc.getByRole("combobox"));

    expect(
      doc.getByText(
        (recipe as RecipeV3<PreferenceRolloutArguments>).latest_revision
          .arguments.slug,
      ),
    ).toBeInTheDocument();
  });
});
