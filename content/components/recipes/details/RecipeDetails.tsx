import React from "react";
import { Divider, Loader, Tag } from "rsuite";

import ActionDetails from "devtools/components/recipes/details/ActionDetails";
import ApprovalRequest from "devtools/components/recipes/details/ApprovalRequest";
import ExperimenterDetails from "devtools/components/recipes/details/ExperimenterDetails";
import FilteringDetails from "devtools/components/recipes/details/FilteringDetails";
import SuitabilityTag from "devtools/components/recipes/details/SuitabilityTag";
import { useRecipeDetailsState } from "devtools/contexts/recipeDetails";

// default export
const RecipeDetails: React.FunctionComponent = () => {
  const { data, statusData } = useRecipeDetailsState();
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
          {__ENV__ === "extension" && <SuitabilityTag />}
        </div>
        <div>
          <Tag color={statusData.enabled ? "green" : "red"}>
            {statusData.enabled ? "Enabled" : "Disabled"}
          </Tag>
        </div>
      </div>
      <Divider />
      <ExperimenterDetails />
      <Divider />
      <ApprovalRequest />
      <ActionDetails />
      <Divider />
      <FilteringDetails />
    </>
  );
};

export default RecipeDetails;
