import PropTypes from "prop-types";
import React from "react";
import { Tag } from "rsuite";

import {
  booleanFormatter,
  codeFormatter,
  multiColumnFormatter,
  tableFormatter,
  tagFormatter,
} from "devtools/components/recipes/details/arguments/formatters";
import GenericArguments from "devtools/components/recipes/details/arguments/GenericArguments";

export default function PreferenceExperiment({ data }) {
  return (
    <GenericArguments
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
          slug(index, value) {
            return <code>{value}</code>;
          },
          ratio(index, value) {
            return <code>{value}</code>;
          },
          value(index, value) {
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

PreferenceExperiment.propTypes = {
  data: PropTypes.object,
};
