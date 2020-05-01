import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { Alert, Icon, IconButton } from "rsuite";

import {
  useEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import { useRecipeDetailsState } from "devtools/contexts/recipeDetails";

export default function RecipeFormHeader() {
  const { recipeId } = useParams();
  const { selectedKey: environmentKey } = useEnvironmentState();
  const history = useHistory();
  const { data, importInstructions } = useRecipeDetailsState();
  const normandyApi = useSelectedNormandyEnvironmentAPI();

  const handleSaveClick = () => {
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
        .then((savedRecipe) => {
          history.push(`/${environmentKey}/recipes/${savedRecipe.id}`);
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

  const handleBackClick = () => {
    if (recipeId) {
      history.push(`/${environmentKey}/recipes/${recipeId}`);
    } else {
      history.push(`/${environmentKey}/recipes`);
    }
  };

  return (
    <div className="page-header">
      <div className="flex-grow-1">
        <IconButton
          appearance="subtle"
          icon={<Icon icon="back-arrow" />}
          onClick={handleBackClick}
        >
          Back
        </IconButton>
      </div>
      <div className="d-flex align-items-center text-right">
        <IconButton
          appearance="primary"
          className="ml-1"
          icon={<Icon icon="save" />}
          onClick={handleSaveClick}
        >
          Save
        </IconButton>
      </div>
    </div>
  );
}
