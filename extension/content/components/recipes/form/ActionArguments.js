import React from "react";
import { ControlLabel, FormGroup } from "rsuite";

import JsonEditor from "devtools/components/common/JsonEditor";
import {
  ACTION_UPDATE_DATA,
  useRecipeFormData,
  useRecipeFormDispatch,
} from "devtools/contexts/recipeForm";

export default function ActionArguments() {
  const data = useRecipeFormData();
  const dispatch = useRecipeFormDispatch();

  const handleChange = (value) => {
    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        arguments: value,
      },
    });
  };

  if (!data.action || !data.action.id) {
    return null;
  }

  return (
    <FormGroup>
      <ControlLabel>Action Arguments</ControlLabel>
      <JsonEditor
        key={data.recipe ? data.recipe.id : "create"}
        value={data.arguments}
        onChange={handleChange}
      />
    </FormGroup>
  );
}
