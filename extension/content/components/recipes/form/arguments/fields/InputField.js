import PropTypes from "prop-types";
import React from "react";
import { ControlLabel, FormGroup, Input } from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

export default function InputField({
  label,
  name,
  changeSideEffect,
  componentClass = "input",
}) {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();

  const handleChange = (value) => {
    let newData = data;

    if (typeof changeSideEffect === "function") {
      newData = changeSideEffect({ data, value, name });
    }

    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...newData,
        arguments: {
          ...newData.arguments,
          [name]: value,
        },
      },
    });
  };

  return (
    <FormGroup>
      <ControlLabel>{label}</ControlLabel>
      <Input
        componentClass={componentClass}
        value={data.arguments[name]}
        onChange={handleChange}
      />
    </FormGroup>
  );
}

InputField.propTypes = {
  componentClass: PropTypes.string,
  changeSideEffect: PropTypes.func,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
};
