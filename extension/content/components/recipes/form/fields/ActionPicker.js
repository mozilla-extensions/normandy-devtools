import React from "react";
import { ControlLabel, FormGroup, InputPicker } from "rsuite";

import { useSelectedNormandyEnvironmentAPI } from "devtools/contexts/environment";
import {
  ACTION_UPDATE_DATA,
  useRecipeFormData,
  useRecipeFormDispatch,
} from "devtools/contexts/recipeForm";

export default function ActionPicker() {
  const data = useRecipeFormData();
  const dispatch = useRecipeFormDispatch();
  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const [actions, setActions] = React.useState([]);
  const value = data.action && data.action.id;

  React.useEffect(() => {
    normandyApi.fetchAllActions().then((allActions) => {
      setActions(allActions);
    });
  }, []);

  const handleChange = (value) => {
    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        action: actions.find((action) => action.id === value),
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
      value: action.id,
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
