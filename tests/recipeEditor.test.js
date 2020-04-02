import React from "react";
import { render, fireEvent, waitForDomChange } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import RecipeEditor from "devtools/components/recipes/RecipeEditor";
import * as Environment from "devtools/contexts/environment";
import NormandyAPI from "devtools/utils/api";
import { ActionsResponse, ConsoleLogRecipeFactory } from "./dataFactory";

describe("`recipeEditor`", () => {
  const setup = () => {
    const mockActions = ActionsResponse();
    const recipeData = ConsoleLogRecipeFactory.build();
    const fetchActionsSpy = jest
      .spyOn(NormandyAPI.prototype, "fetchActions")
      .mockReturnValue(mockActions);

    jest
      .spyOn(Environment, "useSelectedEnvironmentAPI")
      .mockReturnValue(new NormandyAPI());
    jest
      .spyOn(Environment, "useSelectedEnvironmentAuth")
      .mockImplementation(() => {
        return { result: { accessToken: "token" } };
      });

    const fetchRecipeSpy = jest
      .spyOn(NormandyAPI.prototype, "fetchRecipe")
      .mockReturnValue(recipeData);
    const fetchPutSpy = jest.spyOn(NormandyAPI.prototype, "request");
    return { fetchActionsSpy, fetchRecipeSpy, fetchPutSpy, recipeData };
  };

  it("should load Actions from Normandy", async () => {
    const { fetchActionsSpy } = setup();
    const { queryByText, getByRole, container } = render(
      <RecipeEditor match={{ params: {} }} />,
    );
    waitForDomChange({ container }).then(() => {
      expect(fetchActionsSpy).toHaveBeenCalled();
      fireEvent.click(getByRole("combobox"));
      expect(queryByText("No results found")).not.toBeInTheDocument();
    });
  });

  it("should able to edit and save recipe info", async () => {
    const {
      fetchActionsSpy,
      fetchRecipeSpy,
      fetchPutSpy,
      recipeData,
    } = setup();

    const { getByTestId, getByText, container } = render(
      <RecipeEditor match={{ params: { id: 3 } }} />,
    );
    expect(fetchActionsSpy).toHaveBeenCalled();
    expect(fetchRecipeSpy).toHaveBeenCalled();

    const name = "Recipe Name";
    const experimentSlug = "Experiment Slug";
    const { latest_revision } = recipeData;

    waitForDomChange({ container }).then(() => {
      expect(getByTestId("recipeName").value).toBe(latest_revision.name);
      fireEvent.change(getByTestId("recipeName"), {
        target: { value: name },
      });

      fireEvent.change(getByTestId("experimentSlug"), {
        target: { value: experimentSlug },
      });

      fireEvent.click(getByText("Submit"));
      latest_revision.name = name;
      latest_revision.experimenter_slug = experimentSlug;
      latest_revision.arguments = JSON.parse(latest_revision.arguments);

      const extraHeaders = { Authorization: "Bearer token" };
      expect(fetchPutSpy).toBeCalledWith({
        data: latest_revision,
        extraHeaders,
        method: "PUT",
        url: "recipe/3/",
        version: 3,
      });
    });
  });

  it("should produce an error alert with invalid recipe", async () => {
    const { fetchActionsSpy, fetchRecipeSpy, fetchPutSpy } = setup();
    fetchPutSpy.mockRejectedValue({});

    const { getByText } = render(<RecipeEditor match={{ params: {} }} />);
    expect(fetchActionsSpy).toHaveBeenCalled();
    expect(fetchRecipeSpy).toHaveBeenCalled();

    fireEvent.click(getByText("Submit"));
    const data = {};
    const extraHeaders = { Authorization: "Bearer token" };
    expect(fetchPutSpy).toBeCalledWith({
      data,
      extraHeaders,
      method: "POST",
      url: "recipe/",
      version: 3,
    });
    expect(getByText(/An Error Occurred/)).toBeInTheDocument();
  });
});
