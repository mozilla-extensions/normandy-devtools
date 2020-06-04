// @ts-nocheck
import React from "react";
import { Badge, ControlLabel, FormGroup } from "rsuite";

import JsonEditor from "devtools/components/common/JsonEditor";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

const KNOWN_FILTER_TYPES = [
  "channel",
  "version",
  "country",
  "locale",
  "bucketSample",
  "stableSample",
];

export default function FallbackFO() {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const [invalidJSON, setInvalidJson] = React.useState(false);

  const knownFO = [];
  const additionalFO = [];
  if (data.filter_object) {
    data.filter_object.forEach((fo) => {
      if (KNOWN_FILTER_TYPES.includes(fo.type)) {
        knownFO.push(fo);
      } else {
        additionalFO.push(fo);
      }
    });
  }

  const handleChange = (value, err) => {
    if (err) {
      setInvalidJson(true);
    } else {
      setInvalidJson(false);
      let newFilterObjects = [...knownFO];
      if (value) {
        newFilterObjects = newFilterObjects.concat(value);
      }

      dispatch({
        type: ACTION_UPDATE_DATA,
        data: {
          ...data,
          filter_object: newFilterObjects,
        },
      });
    }
  };

  let invalidBadge;
  if (invalidJSON) {
    invalidBadge = <Badge content="Invalid JSON" />;
  }

  const key = data.recipe ? data.recipe.id : "create";

  return (
    <FormGroup>
      <ControlLabel>Additional Filter Objects {invalidBadge}</ControlLabel>

      <JsonEditor key={key} value={additionalFO} onChange={handleChange} />
    </FormGroup>
  );
}
