import PropTypes from "prop-types";
import React from "react";
import { Tag } from "rsuite";

import { tableFormatter } from "devtools/components/recipes/details/arguments/formatters";
import GenericArguments from "devtools/components/recipes/details/arguments/GenericArguments";

export default function BranchedAddonStudy({ data }) {
  return (
    <GenericArguments
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

BranchedAddonStudy.propTypes = {
  data: PropTypes.object,
};
