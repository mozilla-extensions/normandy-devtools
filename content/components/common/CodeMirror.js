// @ts-nocheck
import PropTypes from "prop-types";
import React from "react";
import { Controlled, UnControlled } from "react-codemirror2";

const CodeMirror = React.forwardRef((props, ref) => {
  const { uncontrolled, options, ...cmProps } = props;
  let Component = Controlled;
  if (uncontrolled) {
    Component = UnControlled;
  }

  return (
    <Component
      ref={ref}
      options={{
        mode: "json",
        theme: "ndt",
        indentWithTabs: false,
        indentUnit: 2,
        tabSize: 2,
        ...options,
      }}
      {...cmProps}
    />
  );
});

CodeMirror.displayName = "CodeMirror";
CodeMirror.propTypes = {
  options: PropTypes.object,
  uncontrolled: PropTypes.bool,
};

export default CodeMirror;
