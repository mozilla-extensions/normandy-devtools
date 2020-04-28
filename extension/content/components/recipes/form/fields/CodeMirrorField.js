import React from "react";
import PropTypes from "prop-types";
import { ControlLabel, FormGroup, HelpBlock } from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";
import CodeMirror from "devtools/components/common/CodeMirror";

export default function CodeMirrorField({ name, label, options, required }) {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const value = data[name];

  let helpBlock = null;
  if (required) {
    helpBlock = <HelpBlock>Required</HelpBlock>;
  }

  const handleChange = (value) => {
    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        [name]: value,
      },
    });
  };

  return (
    <FormGroup>
      <ControlLabel>{label}</ControlLabel>
      <CodeMirror
        // @ts-ignore
        options={{
          mode: "javascript",
          lineNumbers: true,
          ...options,
        }}
        value={value}
        onBeforeChange={(editor, data, value) => {
          handleChange(value);
        }}
      />
      {helpBlock}
    </FormGroup>
  );
}

CodeMirrorField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.object,
  required: PropTypes.bool,
};
