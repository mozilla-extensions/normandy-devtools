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
    const approvalRequest = approvalRequestFactory.build({ approved: null });
    const revision = revisionFactory.build(
      { approval_request: approvalRequest },
      { actionName: "branched-addon-study" },
    );
    const recipe = recipeFactory.build();
    recipe.latest_revision = revision;

    /* global renderWithContext */
    // @ts-ignore
    const { getByText } = renderWithContext(
      <RecipeListing
        copyRecipeToArbitrary={() => {}}
        environmentName="prod"
        recipe={recipe}
      />,
    );
    expect(getByText("Pending Review")).toBeInTheDocument();
  });

  it("should have pending review tag when recipe rejected", () => {
    const approvalRequest = approvalRequestFactory.build({ approved: false });
    const revision = revisionFactory.build(
      { approval_request: approvalRequest },
      { actionName: "branched-addon-study" },
    );
    const recipe = recipeFactory.build();
    recipe.latest_revision = revision;

    /* global renderWithContext */
    // @ts-ignore
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
    const approvalRequest = approvalRequestFactory.build({ approved: true });
    const revision = revisionFactory.build(
      { approval_request: approvalRequest },
      { actionName: "branched-addon-study" },
    );
    const recipe = recipeFactory.build();
    recipe.latest_revision = revision;

    /* global renderWithContext */
    // @ts-ignore
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
