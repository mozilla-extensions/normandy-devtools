import { cleanup, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import DisableRecipeButton from "devtools/components/recipes/DisableRecipeButton";
import {
  recipeFactory,
  revisionFactory,
} from "devtools/tests/factories/recipes";
import NormandyAPI from "devtools/utils/normandyApi";

beforeEach(() => {
  restoreConsole();
});

afterEach(async () => {
  modifyConsole();
  jest.clearAllMocks();
  await cleanup();
});

describe("Disable Recipe Button", () => {
  it("should call disableRecipe with clicked", async () => {
    const approved_revision = revisionFactory.build({ enabled: true });
    const recipe = recipeFactory.build({ approved_revision });

    jest
      .spyOn(NormandyAPI.prototype, "disableRecipe")
      .mockImplementation(() => Promise.resolve(recipe));

    jest
      .spyOn(NormandyAPI.prototype, "patchMetaDataRecipe")
      .mockImplementation(() => Promise.resolve({}));

    const doc = renderWithContext(
      <DisableRecipeButton
        postDispatch={false}
        recipe={recipe.approved_revision}
        recipeId={recipe.id}
      />,
    );

    expect(doc.getByText("Disable")).toBeInTheDocument();
    const disabledButton = doc.getByText("Disable");
    fireEvent.click(disabledButton);

    expect(doc.getByText(/Please Provide a Ending Reason/)).toBeInTheDocument();
    const selectOptions = doc.getByText("Select");
    fireEvent.click(selectOptions);
    const experimentComplete = doc.getByText(/Experiment Complete/);
    fireEvent.click(experimentComplete);
    const disableModalButtons = doc.getAllByText("Disable");

    fireEvent.click(disableModalButtons[1]);
    expect(NormandyAPI.prototype.disableRecipe).toBeCalled();
    await waitFor(() =>
      expect(NormandyAPI.prototype.patchMetaDataRecipe).toBeCalled(),
    );
    expect(NormandyAPI.prototype.patchMetaDataRecipe).toBeCalledWith(
      approved_revision.id,
      {
        ending_reason: "Experiment Complete",
      },
    );
  });
});
