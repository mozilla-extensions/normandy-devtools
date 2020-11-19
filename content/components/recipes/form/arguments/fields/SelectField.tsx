import React, { ReactElement } from "react";
import {
  ControlLabel,
  FormGroup,
  HelpBlock,
  InputProps,
  SelectPicker,
} from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
  useRecipeDetailsErrors,
} from "devtools/contexts/recipeDetails";

type SelectFieldProps = InputProps & {
  label: string;
  name: string;
  changeSideEffect?: (change: ChangeData) => void;
  options?: Array<{ label: string; value: string }>;
};

interface ChangeData {
  data: unknown;
  value: unknown;
  name: unknown;
}
export default function SelectField({
  label,
  name,
  options,
  changeSideEffect,
  ...props
}: SelectFieldProps): ReactElement {
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
      <SelectPicker
        block
        cleanable={false}
        data={options}
        searchable={false}
        value={data.arguments[name]}
        onChange={handleChange}
        {...props}
      />
      {errMessages}
    </FormGroup>
  );
}
