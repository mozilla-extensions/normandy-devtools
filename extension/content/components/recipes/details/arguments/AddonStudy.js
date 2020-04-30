import React from "react";

import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";
import Generic from "devtools/components/recipes/details/arguments/Generic";
import {
  nl2pbrFormatter,
  tagFormatter,
} from "devtools/components/recipes/details/arguments/formatters";

export default function AddonStudy() {
  const data = useRecipeDetailsData();

  return (
    <Generic
      data={data.arguments}
      formatters={{
        description: nl2pbrFormatter,
        extensionApiId: tagFormatter({ color: "violet" }),
      }}
      ordering={[
        "name",
        "description",
        "extensionApiId",
        "addonUrl",
        "isEnrollmentPaused",
      ]}
    />
  );
}
