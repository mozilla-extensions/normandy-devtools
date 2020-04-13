import React from "react";
import PropTypes from "prop-types";
import { FormGroup, ControlLabel } from "rsuite";
import CodeMirror from "devtools/components/common/CodeMirror";
export const JsonArgs = React.forwardRef((props, ref) => {
  return (
    <FormGroup>
      <ControlLabel>Action Arguments</ControlLabel>
      <CodeMirror
        options={{
          mode: "javascript",
          lineNumbers: true,
        }}
        style={{
          height: "auto",
        }}
        value={JSON.stringify(props.value, null, 2)}
        ref={ref}
        uncontrolled
      />
    </FormGroup>
  );
});

JsonArgs.displayName = "JsonArgs";
JsonArgs.propTypes = {
  name: PropTypes.string,
  action: PropTypes.integer,
  value: PropTypes.object,
  handleChange: PropTypes.func,
};
