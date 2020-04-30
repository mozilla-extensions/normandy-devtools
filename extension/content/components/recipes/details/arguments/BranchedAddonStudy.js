import React from "react";
import { Tag } from "rsuite";

import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";
import Generic from "devtools/components/recipes/details/arguments/Generic";
import { tableFormatter } from "devtools/components/recipes/details/arguments/formatters";

export default function BranchedAddonStudy() {
  const data = useRecipeDetailsData();

  return (
    <Generic
      data={data.arguments}
      formatters={{
        branches: tableFormatter(["slug", "ratio", "extensionApiId"], {
          slug(index, value) {
            return <code>{value}</code>;
          },
          ratio(index, value) {
            return <code>{value}</code>;
          },
          extensionApiId(index, value) {
            if (value) {
              return <Tag color="violet">{value}</Tag>;
            }

            return (
              <code>
                <em>(no extension selected)</em>
              </code>
            );
          },
        }),
      }}
      ordering={[
        "userFacingName",
        "userFacingDescription",
        "slug",
        "isEnrollmentPaused",
        "branches",
      ]}
    />
  );
}
