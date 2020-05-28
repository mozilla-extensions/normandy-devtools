// @ts-nocheck
import React from "react";
import { ControlLabel, FormGroup } from "rsuite";

import JsonEditor from "devtools/components/common/JsonEditor";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";
import { partitionFO } from "devtools/components/recipes/form/filters/partitionFO";

export default function FallbackFO() {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();

  let knownFO = [];
  let additionalFO = [];
  if (data.filter_object) {
    [knownFO, additionalFO] = partitionFO(data.filter_object);
  }

  const handleChange = (value) => {
    if (value) {
      [knownFO, additionalFO] = partitionFO(data.filter_object);
      const newFilterObjects = [...knownFO, ...value];

      dispatch({
        type: ACTION_UPDATE_DATA,
        data: {
          ...data,
          filter_object: newFilterObjects,
        },
      });
    }
  };

  let key = data.recipe ? data.recipe.id : "create";
  key += "FO";
  return (
    <FormGroup>
      <ControlLabel>Additional Filter Objects</ControlLabel>
      <JsonEditor key={key} value={additionalFO} onChange={handleChange} />
    </FormGroup>
  );
}
