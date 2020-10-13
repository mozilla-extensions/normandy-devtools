import PropTypes from "prop-types";
import React from "react";
import { Tag } from "rsuite";

import { tableFormatter } from "devtools/components/recipes/details/arguments/formatters";
import GenericArguments from "devtools/components/recipes/details/arguments/GenericArguments";
import { useExperimenterDetailsData } from "devtools/contexts/experimenterDetails";

export default function BranchedAddonStudy({ data }) {
  const experimenterData = useExperimenterDetailsData();
  return (
    <GenericArguments
      data={data.arguments}
      formatters={{
        branches: tableFormatter(
          ["slug", "description", "ratio", "extensionApiId"],
          {
            slug(index, value) {
              return <code>{value}</code>;
            },
            description(index) {
              const { slug } = data.arguments.branches[index];
              return experimenterData.variants
                ? experimenterData.variants[slug]
                : null;
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
          },
        ),
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
