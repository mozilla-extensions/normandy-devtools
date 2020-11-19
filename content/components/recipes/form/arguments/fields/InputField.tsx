import React from "react";
import { ControlLabel, FormGroup, Input, InputProps, HelpBlock } from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
  useRecipeDetailsErrors,
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
      {errMessages}
    </FormGroup>
  );
};

export default InputField;
