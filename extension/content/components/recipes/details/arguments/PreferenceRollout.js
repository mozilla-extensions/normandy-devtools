import React from "react";
import { Tag } from "rsuite";

import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";
import Generic from "devtools/components/recipes/details/arguments/Generic";
import { tableFormatter } from "devtools/components/recipes/details/arguments/formatters";

export default function PreferenceRollout() {
  const data = useRecipeDetailsData();

  return (
    <Generic
      data={data.arguments}
      formatters={{
        preferences: tableFormatter(["preferenceName", "type", "value"], {
          preferenceName(index, value) {
            return <code>{value}</code>;
          },
          type(index) {
            const preference = data.arguments.preferences[index].value;
            const preferenceType = typeof preference;
            return <Tag>{preferenceType.replace("number", "integer")}</Tag>;
          },
          value(index, value) {
            const preference = data.arguments.preferences[index].value;
            const preferenceType = typeof preference;
            if (preferenceType === "boolean") {
              return (
                <Tag color={value ? "green" : "red"}>
                  {value ? "True" : "False"}
                </Tag>
              );
            }

            return <code>{value}</code>;
          },
        }),
      }}
      ordering={["slug", "preferences"]}
    />
  );
}
