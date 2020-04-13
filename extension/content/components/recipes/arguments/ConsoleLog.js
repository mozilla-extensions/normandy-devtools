import React from "react";
import PropTypes from "prop-types";
import { Input, FormGroup, ControlLabel } from "rsuite";

export default function ConsoleLog(props) {
  const onChange = (value) => {
    const message = { message: value };
    props.handleChange("arguments", message);
  };
  return (
    <FormGroup>
      <ControlLabel>Message</ControlLabel>
      <Input
        name={"consoleLogArgument"}
        value={props.value ? props.value.message : null}
        onChange={(value) => onChange(value)}
      />
    </FormGroup>
  );
}

ConsoleLog.propTypes = {
  handleChange: PropTypes.func,
  value: PropTypes.object,
};
