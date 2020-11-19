import PropTypes from "prop-types";
import React from "react";
import { ControlLabel, FormGroup, HelpBlock, Toggle } from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
  useRecipeDetailsErrors,
} from "devtools/contexts/recipeDetails";

export default function ToggleField({
  children,
  label,
  name,
  changeSideEffect,
}) {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const { serverErrors } = useRecipeDetailsErrors();

  const { arguments: { [name]: fieldErrors = [] } = {} } = serverErrors;
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
      <div className="d-flex">
        <span className="pr-2 pt-1">
          <Toggle checked={data.arguments[name]} onChange={handleChange} />
        </span>
        <HelpBlock className="flex-grow-1">{children}</HelpBlock>
        {errMessages}
      </div>
    </FormGroup>
  );
}

ToggleField.propTypes = {
  changeSideEffect: PropTypes.func,
  children: PropTypes.any,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
};
