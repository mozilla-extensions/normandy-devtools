import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import RecipesPage from "devtools/components/pages/RecipesPage";
import api from "devtools/utils/api";

describe("The `Recipe Page` component", () => {
  it("should render all environments when settings is clicked", async () => {
    jest
      .spyOn(api, "fetchRecipePage")
      .mockImplementation(() => ({ results: [] }));
    const { getByText, getByTestId, getAllByText } = await render(
      <RecipesPage />,
    );

    expect(getByText("Settings")).toBeInTheDocument();
    fireEvent.click(getByTestId("settings"));

    expect(getByText("Environment")).toBeInTheDocument();
    fireEvent.click(getByTestId("environments"));

    expect(getAllByText("Prod")).toHaveLength(2);
    expect(getByText("Stage")).toBeInTheDocument();
    expect(getByText("Dev")).toBeInTheDocument();
  });
});
