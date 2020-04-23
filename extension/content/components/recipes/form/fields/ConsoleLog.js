import React from "react";
import PropTypes from "prop-types";
import { Input, FormGroup, ControlLabel } from "rsuite";

export default function ConsoleLog(props) {
  const { value: actionArgs, onChange } = props;
  const handleChange = (value) => {
    onChange({ ...actionArgs, message: value });
  };

  return (
    <FormGroup>
      <ControlLabel>Message</ControlLabel>
      <Input
        name="consoleLogArgument"
        value={actionArgs ? actionArgs.message : null}
        onChange={(newValue) => handleChange(newValue)}
      />
    </FormGroup>
  );
}

ConsoleLog.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.object,
};
