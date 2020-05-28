// @ts-nocheck
import React from "react";
import { Badge, ControlLabel, FormGroup, Row } from "rsuite";

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
  const [invalidJSON, setInvalidJson] = React.useState(false);

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
      setInvalidJson(false);
    } else {
      setInvalidJson(true);
    }
  };

  const inValidBadge = () => {
    if (invalidJSON) {
      return <Badge content="Invalid JSON" />;
    }

    return null;
  };

  let key = data.recipe ? data.recipe.id : "create";
  key += "FO";
  return (
    <FormGroup>
      <Row>
        <ControlLabel>Additional Filter Objects {inValidBadge()}</ControlLabel>
      </Row>

      <JsonEditor key={key} value={additionalFO} onChange={handleChange} />
    </FormGroup>
  );
}
