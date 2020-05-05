import React from "react";
import { Divider, Loader, Tag } from "rsuite";

import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";
import SuitabilityTag from "devtools/components/recipes/details/SuitabilityTag";
import ActionDetails from "devtools/components/recipes/details/ActionDetails";
import FilteringDetails from "devtools/components/recipes/details/FilteringDetails";
import ApprovalRequest from "devtools/components/recipes/details/ApprovalRequest";

export default function RecipeDetails() {
  const data = useRecipeDetailsData();

  if (!data.recipe) {
    return (
      <div className="text-center">
        <Loader content="Loading recipe&hellip;" />
      </div>
    );
  }

  return (
    <>
      <div className="d-flex">
        <div className="pr-2">
          <Tag color="violet">{data.recipe && data.recipe.id}</Tag>
        </div>
        <div className="flex-grow-1 pr-2">
          <h5>{data.name}</h5>
        </div>
        <div className="pr-1">
          <SuitabilityTag />
        </div>
        <div>
          <Tag color={data.enabled ? "green" : "red"}>
            {data.enabled ? "Enabled" : "Disabled"}
          </Tag>
        </div>
      </div>
      <Divider />
      <ApprovalRequest />
      <ActionDetails />
      <Divider />
      <FilteringDetails />
    </>
  );
}
