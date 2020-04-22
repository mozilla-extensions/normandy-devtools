import React from "react";
import PropTypes from "prop-types";
import { ControlLabel, FormGroup, HelpBlock, Input } from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

export default function GenericField({ name, label, required }) {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const value = data[name] || "";

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
      <Input value={value} onChange={handleChange} />
      {helpBlock}
    </FormGroup>
  );
}

GenericField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  required: PropTypes.bool,
};
