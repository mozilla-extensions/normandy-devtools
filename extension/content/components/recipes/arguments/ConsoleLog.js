import React from "react";
import PropTypes from "prop-types";
import { Input, FormGroup, ControlLabel } from "rsuite";

export default function ConsoleLog(props) {
  const handleChange = (value) => {
    const message = { message: value };
    props.onChange(message);
  };
  return (
    <FormGroup>
      <ControlLabel>Message</ControlLabel>
      <Input
        name={"consoleLogArgument"}
        value={props.value ? props.value.message : null}
        onChange={(value) => handleChange(value)}
      />
    </FormGroup>
  );
}

ConsoleLog.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.object,
};
