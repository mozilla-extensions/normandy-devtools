import PropTypes from "prop-types";
import React from "react";
import { ControlLabel, FormGroup, SelectPicker } from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

export default function SelectField({
  label,
  name,
  options,
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
      <SelectPicker
        block
        cleanable={false}
        data={options}
        searchable={false}
        value={data.arguments[name]}
        onChange={handleChange}
      />
    </FormGroup>
  );
}

SelectField.propTypes = {
  changeSideEffect: PropTypes.func,
  options: PropTypes.array.isRequired,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
};
