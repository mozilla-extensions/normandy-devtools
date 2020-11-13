import PropTypes from "prop-types";
import React from "react";
import { ControlLabel, FormGroup, HelpBlock, Input } from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
  useRecipeDetailsErrors,
} from "devtools/contexts/recipeDetails";

export default function GenericField({ name, label, required }) {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const { clientErrors } = useRecipeDetailsErrors();
  const value = data[name] || "";

  const { [name]: fieldErrors = [] } = clientErrors;
  let errMessages;
  if (fieldErrors.length) {
    errMessages = (
      <HelpBlock className="text-red">
        {fieldErrors.map((err) => {
          return <li key={err}>{err}</li>;
        })}
      </HelpBlock>
    );
  }

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
      {errMessages}
      {helpBlock}
    </FormGroup>
  );
}

GenericField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  required: PropTypes.bool,
};
