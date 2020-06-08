import PropTypes from "prop-types";
import React from "react";
import { Tag } from "rsuite";

import { tableFormatter } from "devtools/components/recipes/details/arguments/formatters";
import GenericArguments from "devtools/components/recipes/details/arguments/GenericArguments";

export default function PreferenceRollout({ data }) {
  return (
    <GenericArguments
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

PreferenceRollout.propTypes = {
  data: PropTypes.object,
};
