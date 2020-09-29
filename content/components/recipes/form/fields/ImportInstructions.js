import React from "react";
import { useParams } from "react-router-dom";
import { ControlLabel, FormGroup, HelpBlock, Input } from "rsuite";

import {
  ACTION_UPDATE_IMPORT_INSTRUCTIONS,
  useRecipeDetailsDispatch,
  useRecipeDetailsImportInstructions,
} from "devtools/contexts/recipeDetails";

export default function ImportInstructions() {
  const { experimenterSlug } = useParams();
  const importInstructions = useRecipeDetailsImportInstructions();
  const dispatch = useRecipeDetailsDispatch();

  if (!experimenterSlug) {
    return null;
  }

  const handleChange = (value) => {
    dispatch({
      type: ACTION_UPDATE_IMPORT_INSTRUCTIONS,
      importInstructions: value,
    });
  };

  return (
    <FormGroup>
      <ControlLabel>Import Instuctions</ControlLabel>
      <Input
        componentClass="textarea"
        rows={5}
        style={{ resize: "vertical", maxHeight: "none" }}
        value={importInstructions}
        onChange={handleChange}
      />
      <HelpBlock>This field must be cleared before you can save.</HelpBlock>
    </FormGroup>
  );
}
