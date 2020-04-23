import React from "react";
import PropTypes from "prop-types";
import { Input, FormGroup, ControlLabel } from "rsuite";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

export default function ConsoleLog() {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const handleChange = (value) => {
    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        arguments: {
          ...data.arguments,
          message: value,
        },
      },
    });
  };

  return (
    <FormGroup>
      <ControlLabel>Message</ControlLabel>
      <Input
        name="consoleLogArgument"
        value={data.arguments.message}
        onChange={handleChange}
      />
    </FormGroup>
  );
}

ConsoleLog.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.object,
};
