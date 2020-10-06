import React from "react";
import { ControlLabel, FormGroup, Input, InputProps } from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

type InputFieldProps = InputProps & {
  name: string;
  label?: string;
  changeSideEffect?: (change: ChangeData) => void;
};

interface ChangeData {
  data: unknown;
  value: unknown;
  name: unknown;
}

// export default
const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  changeSideEffect,
  ...props
}) => {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();

  const handleChange = (value): void => {
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
      <Input value={data.arguments[name]} onChange={handleChange} {...props} />
    </FormGroup>
  );
};

export default InputField;
