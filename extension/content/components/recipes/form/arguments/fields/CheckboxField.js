import PropTypes from "prop-types";
import React from "react";
import { ControlLabel, FormGroup, Checkbox } from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

export default function CheckboxField({
  label,
  name,
  helpText,
  changeSideEffect,
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
      <Checkbox
        checked={data.arguments[name]}
        onChange={(_, value) => handleChange(value)}
      >
        {helpText}
      </Checkbox>
    </FormGroup>
  );
}

CheckboxField.propTypes = {
  changeSideEffect: PropTypes.func,
  helpText: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
};
