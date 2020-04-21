import React from "react";
import PropTypes from "prop-types";
import { FormGroup, ControlLabel } from "rsuite";
import JsonEditor from "devtools/components/common/JsonEditor";

export default function GenericArgField({ value, onChange }) {
  return (
    <FormGroup>
      <ControlLabel>Action Arguments</ControlLabel>
      <JsonEditor value={value} onChange={(newValue) => onChange(newValue)} />
    </FormGroup>
  );
}

GenericArgField.propTypes = {
  action: PropTypes.number,
  value: PropTypes.object,
  onChange: PropTypes.func.required,
};
