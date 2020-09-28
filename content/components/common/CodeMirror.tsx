import React from "react";
import { Controlled, IControlledCodeMirror } from "react-codemirror2";

// default export
const CodeMirror: React.FC<IControlledCodeMirror> = ({
  options,
  ...cmProps
}) => {
  options = {
    mode: "json",
    theme: "ndt",
    indentWithTabs: false,
    indentUnit: 2,
    tabSize: 2,
    ...options,
  };

  return <Controlled options={options} {...cmProps} />;
};

export default CodeMirror;
