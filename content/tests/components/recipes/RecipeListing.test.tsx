/* eslint-disable @typescript-eslint/no-empty-function */
import { cleanup, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import RecipeListing from "devtools/components/recipes/RecipeListing";
import { recipeFactory } from "devtools/tests/factories/recipes";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      __ENV__: string;
    }
  }
}
afterEach(async () => {
  jest.clearAllMocks();
  await cleanup();
});

describe("RecipeListing", () => {
  it("should have pending review tag when no approval", () => {
    const recipe = recipeFactory.build({
      latest_revision: {
        approval_request: {
          approved: null,
        },
      },
    });

    const { getByText } = renderWithContext(
      <RecipeListing
        copyRecipeToArbitrary={() => {}}
        environmentName="prod"
        recipe={recipe}
      />,
    );
    expect(getByText("Pending Review")).toBeInTheDocument();
  });

  it("should not have pending review tag when recipe rejected", () => {
    const recipe = recipeFactory.build({
      latest_revision: {
        approval_request: {
          approved: false,
        },
      },
    });

    const { queryByText } = renderWithContext(
      <RecipeListing
        copyRecipeToArbitrary={() => {}}
        environmentName="prod"
        recipe={recipe}
      />,
    );
    expect(queryByText("Pending Review")).toBeNull();
  });

  it("should not have pending review tag when recipe approved", () => {
    const recipe = recipeFactory.build({
      latest_revision: {
        approval_request: {
          approved: true,
        },
      },
    });

    const { queryByText } = renderWithContext(
      <RecipeListing
        copyRecipeToArbitrary={() => {}}
        environmentName="prod"
        recipe={recipe}
      />,
    );
    expect(queryByText("Pending Review")).toBeNull();
  });

  it("should not have run buttons and suit. tag when ENV is web ", () => {
    global.__ENV__ = "web";
    const recipe = recipeFactory.build();

    const { queryByText, getByTitle } = renderWithContext(
      <RecipeListing
        copyRecipeToArbitrary={() => {}}
        environmentName="prod"
        recipe={recipe}
      />,
    );

    expect(queryByText("Match")).toBeNull();

    fireEvent.focus(getByTitle("recipe-menu"));
    expect(queryByText("Run")).toBeNull();
  });

  it("should have run buttons and suit. tag when ENV is extension", async () => {
    global.__ENV__ = "extension";
    const recipe = recipeFactory.build();

    const { getByText, getByTitle } = renderWithContext(
      <RecipeListing
        copyRecipeToArbitrary={() => {}}
        environmentName="prod"
        recipe={recipe}
      />,
    );

    await waitFor(() => {
      expect(getByText("Match")).toBeInTheDocument();
    });

    fireEvent.focus(getByTitle("recipe-menu"));

    expect(getByText("Run")).toBeInTheDocument();
    expect(getByText("Custom Run")).toBeInTheDocument();
  });
});
