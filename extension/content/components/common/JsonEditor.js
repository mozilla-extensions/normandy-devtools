// @ts-nocheck
import React, { useState } from "react";
import PropTypes from "prop-types";

import CodeMirror from "devtools/components/common/CodeMirror";

export default function JsonEditor({ value, onChange }) {
  const [internalState, setInternalState] = useState(() =>
    JSON.stringify(value, null, 2),
  );

  function handleNewValue(_editor, _data, value) {
    setInternalState(value);
    try {
      const parsed = JSON.parse(value);
      onChange(parsed);
    } catch (err) {
      onChange(null);
    }
  }

  return (
    <CodeMirror
      options={{
        mode: "javascript",
        lineNumbers: true,
      }}
      value={internalState}
      onBeforeChange={handleNewValue}
    />
  );
}

JsonEditor.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};
