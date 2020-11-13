import React from "react";
import { ControlLabel, FormControl, FormGroup, HelpBlock } from "rsuite";

import ActionSelector from "devtools/components/common/ActionSelector";
import { INITIAL_ACTION_ARGUMENTS } from "devtools/components/recipes/form/ActionArguments";
import { useSelectedNormandyEnvironmentAPI } from "devtools/contexts/environment";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
  useRecipeDetailsErrors,
} from "devtools/contexts/recipeDetails";

export default function ActionPicker() {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const { clientErrors } = useRecipeDetailsErrors();
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

  const { action_id: fieldErrors = [] } = clientErrors;
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
      {errMessages}
    </FormGroup>
  );
}
