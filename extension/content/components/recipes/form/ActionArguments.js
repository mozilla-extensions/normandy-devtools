import React from "react";
import { ControlLabel, FormGroup } from "rsuite";

import JsonEditor from "devtools/components/common/JsonEditor";
import ConsoleLog from "devtools/components/recipes/form/fields/ConsoleLog";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

const actionFieldsMapping = { "console-log": ConsoleLog };

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

  let ArgumentField = actionFieldsMapping[data.action.name];

  if (!ArgumentField) {
    ArgumentField = JsonEditor;
  }

  return (
    <FormGroup>
      <ControlLabel>Action Arguments</ControlLabel>
      <ArgumentField
        key={data.recipe ? data.recipe.id : "create"}
        value={data.arguments}
        onChange={handleChange}
      />
    </FormGroup>
  );
}
