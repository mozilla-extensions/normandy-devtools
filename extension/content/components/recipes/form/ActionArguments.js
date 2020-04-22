import React from "react";
import { ControlLabel, FormGroup } from "rsuite";

import JsonEditor from "devtools/components/common/JsonEditor";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

export default function ActionArguments() {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();

  const handleChange = (value) => {
    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        arguments: value,
      },
    });
  };

  if (!data.action || !data.action.name) {
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
