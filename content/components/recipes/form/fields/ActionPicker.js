import React from "react";
import { ControlLabel, FormControl, FormGroup } from "rsuite";

import ActionSelector from "devtools/components/common/ActionSelector";
import { INITIAL_ACTION_ARGUMENTS } from "devtools/components/recipes/form/ActionArguments";
import { useSelectedNormandyEnvironmentAPI } from "devtools/contexts/environment";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

export default function ActionPicker() {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const value = data.action && data.action.name;

  const handleChange = (action) => {
    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        arguments: INITIAL_ACTION_ARGUMENTS[action.name] || {},
        action,
      },
    });
  };

  return (
    <FormGroup>
      <ControlLabel>Action</ControlLabel>
      <FormControl
        block
        accepter={ActionSelector}
        classPrefix="d-block "
        cleanable={false}
        disabled={data.recipe && data.recipe.id}
        normandyApi={normandyApi}
        placeholder="Select an action"
        placement="autoVerticalStart"
        value={value}
        onChangeAction={handleChange}
      />
    </FormGroup>
  );
}
