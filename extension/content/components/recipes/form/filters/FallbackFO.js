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

  let knownFO = [];
  let additionalFO = [];
  if (data.filter_object) {
    [knownFO, additionalFO] = data.filter_object.reduce(
      ([knownFO, additionalFO], fo) => {
        if (fo && KNOWN_FILTER_TYPES.includes(fo.type)) {
          return [[...knownFO, fo], additionalFO];
        }

        return [knownFO, [...additionalFO, fo]];
      },
      [[], []],
    );
  }

  const handleChange = (value) => {
    if (value) {
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
