import React from "react";
import { ControlLabel, FormGroup, InputPicker } from "rsuite";

import {
  useEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";
import { INITIAL_ACTION_ARGUMENTS } from "devtools/components/recipes/form/ActionArguments";

export default function ActionPicker() {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const { selectedKey: environmentKey } = useEnvironmentState();
  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const [actions, setActions] = React.useState([]);
  const value = data.action && data.action.name;

  React.useEffect(() => {
    normandyApi.fetchAllActions().then((allActions) => {
      setActions(allActions);
    });
  }, [environmentKey]);

  const handleChange = (value) => {
    const action = actions.find((a) => a.name === value);
    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        arguments: INITIAL_ACTION_ARGUMENTS[action.name] || {},
        action,
      },
    });
  };

  const options = actions
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      }

      return 0;
    })
    .map((action) => ({
      label: action.name,
      value: action.name,
    }));

  return (
    <FormGroup>
      <ControlLabel>Actions</ControlLabel>
      <InputPicker
        block
        cleanable={false}
        data={options}
        placeholder="Select an action"
        placement="autoVerticalStart"
        value={value}
        onChange={handleChange}
      />
    </FormGroup>
  );
}
