import { cleanup } from "@testing-library/react";
import React from "react";

import RecipeListing from "devtools/components/recipes/RecipeListing";
import {
  approvalRequestFactory,
  revisionFactory,
  recipeFactory,
} from "devtools/tests/factories/recipes";

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
});
