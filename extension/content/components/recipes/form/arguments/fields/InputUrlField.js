import PropTypes from "prop-types";
import React from "react";
import { ControlLabel, FormGroup, Input, InputGroup, Icon } from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

export default function InputUrlField({ label, name, changeSideEffect }) {
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
      <InputGroup>
        <Input value={data.arguments[name]} onChange={handleChange} />
        <InputGroup.Button onClick={() => window.open(data.arguments[name])}>
          <Icon icon="link" />
          View
        </InputGroup.Button>
      </InputGroup>
    </FormGroup>
  );
}

InputUrlField.propTypes = {
  changeSideEffect: PropTypes.func,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
};
