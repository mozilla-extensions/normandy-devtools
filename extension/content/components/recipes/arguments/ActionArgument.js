import React from "react";
import PropTypes from "prop-types";
import GenericArgField from "devtools/components/recipes/arguments/GenericArgField";
import ConsoleLog from "devtools/components/recipes/arguments/ConsoleLog";

const actionFieldsMapping = { "console-log": ConsoleLog };

export default function ActionArgument({ value, onChange, action }) {
  if (!action) {
    return null;
  }
  let ArgField = actionFieldsMapping[action.name];
  let argProps = { value, onChange };
  if (!ArgField) {
    ArgField = GenericArgField;
  }
  return <ArgField {...argProps} />;
}

ActionArgument.displayName = "ActionArgument";
ActionArgument.propTypes = {
  action: PropTypes.number,
  value: PropTypes.object,
  onChange: PropTypes.func.required,
};
