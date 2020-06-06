// @ts-nocheck
import PropTypes from "prop-types";
import React, { useState } from "react";

import CodeMirror from "devtools/components/common/CodeMirror";

export default function JsonEditor({ value, onChange, options, ...props }) {
  const [internalState, setInternalState] = useState(() =>
    JSON.stringify(value, null, 2),
  );

  function handleNewValue(_editor, _data, value) {
    setInternalState(value);
    try {
      const parsed = JSON.parse(value);
      onChange(parsed);
    } catch (err) {
      onChange(value, err);
    }
  }

  return (
    <CodeMirror
      options={{
        mode: "javascript",
        lineNumbers: true,
        ...options,
      }}
      value={internalState}
      onBeforeChange={handleNewValue}
      {...props}
    />
  );
}

JsonEditor.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.object,
};
