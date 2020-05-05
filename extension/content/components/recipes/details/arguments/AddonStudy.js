import React from "react";
import PropTypes from "prop-types";

import GenericArguments from "devtools/components/recipes/details/arguments/GenericArguments";
import {
  nl2pbrFormatter,
  tagFormatter,
} from "devtools/components/recipes/details/arguments/formatters";

export default function AddonStudy({ data }) {
  return (
    <GenericArguments
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

AddonStudy.propTypes = {
  data: PropTypes.object,
};
