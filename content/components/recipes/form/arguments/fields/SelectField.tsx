import React, { ReactElement, useContext } from "react";
import { ControlLabel, FormGroup, InputProps, SelectPicker } from "rsuite";

import ServerErrors from "devtools/components/recipes/form/ServerErrors";
import { layoutContext } from "devtools/contexts/layout";
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
  const { container } = useContext(layoutContext);

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
        container={container}
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
