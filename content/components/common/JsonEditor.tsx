import React, { useState } from "react";
import { IControlledCodeMirror } from "react-codemirror2";

import CodeMirror from "devtools/components/common/CodeMirror";

type JsonValue = Record<string, unknown> | Array<unknown>;

type JsonEditorProps = Omit<
  IControlledCodeMirror,
  "onBeforeChange" | "value"
> & {
  value?: JsonValue;
  onChange: (newValue: JsonValue, err?: unknown) => void;
};

// export default
const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  options,
  ...props
}) => {
  const [internalState, setInternalState] = useState(() =>
    JSON.stringify(value, null, 2),
  );

  function handleNewValue(_editor, _data, value): void {
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
};

export default JsonEditor;
