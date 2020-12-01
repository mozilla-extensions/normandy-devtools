import React, { ReactElement } from "react";
import { ControlLabel, FormGroup, InputProps, SelectPicker } from "rsuite";

import ServerErrors from "devtools/components/recipes/form/ServerErrors";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

type SelectFieldProps = InputProps & {
  label: string;
  parent?: string;
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
      <ServerErrors field={`arguments.${name}`} />
    </FormGroup>
  );
}
