// @ts-nocheck
import React from "react";
import { ControlLabel, FormGroup, HelpBlock } from "rsuite";

import JsonEditor from "devtools/components/common/JsonEditor";
import {
  ACTION_UPDATE_DATA,
  ACTION_UPDATE_CLIENT_ERRORS,
  ACTION_REMOVE_CLIENT_ERRORS,
  useRecipeDetailsData,
  useRecipeDetailsErrors,
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
  const errors = useRecipeDetailsErrors();
  const { clientErrors } = errors;
  const dispatch = useRecipeDetailsDispatch();
  const filter_object_errors = clientErrors.filter_object || [];

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

  const invalidJson = "Filter Object(s) is not valid JSON";
  const notAnArray = "Filter Object(s) is not contained in an array";

  const validateFO = (value, err) => {
    let action = ACTION_REMOVE_CLIENT_ERRORS;
    let actionArgs = { name: "filter_object" };
    const foErrors = [];
    if (value) {
      if (err) {
        foErrors.push(invalidJson);
      }

      if (!Array.isArray(value)) {
        foErrors.push(notAnArray);
      }
    }

    if (foErrors) {
      action = ACTION_UPDATE_CLIENT_ERRORS;
      actionArgs = { ...actionArgs, errors: foErrors };
    }

    dispatch({
      type: action,
      ...actionArgs,
    });
  };

  const handleChange = (value, err) => {
    validateFO(value, err);

    if (filter_object_errors) {
      let newFilterObjects = knownFO;
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

  let errMessages;
  if (filter_object_errors) {
    errMessages = (
      <HelpBlock className="text-red">
        {filter_object_errors.map((err) => {
          return <li key={err}>{err}</li>;
        })}
      </HelpBlock>
    );
  }

  const key = data.recipe ? data.recipe.id : "create";

  return (
    <FormGroup>
      <ControlLabel>Additional Filter Objects</ControlLabel>
      <JsonEditor key={key} value={additionalFO} onChange={handleChange} />
      {errMessages}
    </FormGroup>
  );
}
