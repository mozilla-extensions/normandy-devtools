import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { Alert, Button, ButtonToolbar, Form } from "rsuite";

import GenericField from "devtools/components/recipes/form/fields/GenericField";
import CodeMirrorField from "devtools/components/recipes/form/fields/CodeMirrorField";
import ActionPicker from "devtools/components/recipes/form/fields/ActionPicker";
import ActionArguments from "devtools/components/recipes/form/ActionArguments";
import FilterObjects from "devtools/components/recipes/form/FilterObjects";
import ImportInstructions from "devtools/components/recipes/form/fields/ImportInstructions";
import {
  useEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import { useRecipeDetailsState } from "devtools/contexts/recipeDetails";

export default function RecipeForm() {
  const history = useHistory();
  const { recipeId } = useParams();
  const { environmentKey } = useEnvironmentState();
  const { data, importInstructions } = useRecipeDetailsState();
  const normandyApi = useSelectedNormandyEnvironmentAPI();

  const handleSubmitClick = () => {
    try {
      if (importInstructions) {
        throw Error("Import Instructions not empty!");
      }

      /* eslint-disable no-unused-vars */
      const { comment: _omitComment, action, ...cleanedData } = data;
      /* eslint-enable no-unused-vars */

      const requestSave = normandyApi.saveRecipe(recipeId, {
        ...cleanedData,
        action_id: action.id,
      });

      requestSave
        .then(() => {
          history.push(`/${environmentKey}/recipes`);
          Alert.success("Changes Saved");
        })
        .catch((err) => {
          console.warn(err.message, err.data);
          Alert.error(`An Error Occurred: ${JSON.stringify(err.data)}`, 5000);
        });
    } catch (err) {
      Alert.error(err.message);
    }
  };

  const handleCancelClick = () => {
    if (window.history.length > 1) {
      window.history.go(-1);
    } else {
      history.push(`/${environmentKey}/recipes`);
    }
  };

  return (
    <Form fluid>
      <GenericField required label="Name" name="name" />

      <GenericField label="Experimenter Slug" name="experimenter_slug" />

      <ImportInstructions />

      <FilterObjects />

      <CodeMirrorField
        label="Extra Filter Expression"
        name="extra_filter_expression"
      />

      <ActionPicker />

      <ActionArguments />

      <ButtonToolbar>
        <Button appearance="primary" onClick={handleSubmitClick}>
          Submit
        </Button>
        <Button appearance="default" onClick={handleCancelClick}>
          Cancel
        </Button>
      </ButtonToolbar>
    </Form>
  );
}
