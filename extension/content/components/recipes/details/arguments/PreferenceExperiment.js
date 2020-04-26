import React from "react";

import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";
import Generic from "devtools/components/recipes/details/arguments/Generic";
import {
  booleanFormatter,
  codeFormatter,
  multiColumnFormatter,
  tableFormatter,
  tagFormatter,
} from "devtools/components/recipes/details/arguments/formatters";
import { Tag } from "rsuite";

export default function PreferenceExperiment() {
  const data = useRecipeDetailsData();
  return (
    <Generic
      data={data.arguments}
      formatters={{
        "row-1": multiColumnFormatter(["preferenceName", "slug"], {
          preferenceName: codeFormatter,
          slug: codeFormatter,
        }),
        "row-2": multiColumnFormatter(
          ["preferenceType", "preferenceBranchType"],
          {
            preferenceType: tagFormatter(),
            preferenceBranchType: tagFormatter(),
          },
        ),
        "row-3": multiColumnFormatter(["isEnrollmentPaused", "isHighVolume"], {
          isEnrollmentPaused: booleanFormatter,
          isHighVolume: booleanFormatter,
        }),
        branches: tableFormatter(["slug", "ratio", "value"], {
          slug(key, value) {
            return <code>{value}</code>;
          },
          ratio(key, value) {
            return <code>{value}</code>;
          },
          value(key, value) {
            if (data.arguments.preferenceType === "boolean") {
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
      omit={[
        "preferenceName",
        "slug",
        "preferenceType",
        "preferenceBranchType",
        "isEnrollmentPaused",
        "isHighVolume",
      ]}
      ordering={[
        "row-1",
        "row-2",
        "row-3",
        "experimentDocumentUrl",
        "branches",
      ]}
    />
  );
}
