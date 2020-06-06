import React from "react";
import { useParams } from "react-router-dom";

import RecipeForm from "devtools/components/recipes/form/RecipeForm";
import RecipeFormHeader from "devtools/components/recipes/form/RecipeFormHeader";
import {
  useEnvironmentState,
  useSelectedExperimenterEnvironmentAPI,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import {
  INITIAL_RECIPE_DATA,
  RecipeDetailsProvider,
} from "devtools/contexts/recipeDetails";

export default function RecipeFormPage() {
  const { selectedKey: environmentKey } = useEnvironmentState();
  const { recipeId, experimenterSlug } = useParams();
  const [data, setData] = React.useState({});
  const [importInstructions, setImportInstructions] = React.useState("");

  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const experimenterApi = useSelectedExperimenterEnvironmentAPI();

  React.useEffect(() => {
    if (recipeId) {
      normandyApi.fetchRecipe(recipeId).then((recipeData) => {
        setData(recipeData.latest_revision);
        setImportInstructions("");
      });
    } else if (experimenterSlug) {
      normandyApi.fetchAllActions().then((actions) => {
        experimenterApi
          .fetchRecipe(experimenterSlug)
          .then(({ comment, action_name, ...recipeData }) => {
            setData({
              ...recipeData,
              action: actions.find((a) => a.name === action_name),
            });
            setImportInstructions(comment);
          });
      });
    } else {
      setData(INITIAL_RECIPE_DATA);
      setImportInstructions("");
    }
  }, [recipeId, experimenterSlug, environmentKey]);

  return (
    <RecipeDetailsProvider data={data} importInstructions={importInstructions}>
      <div className="d-flex flex-column h-100">
        <RecipeFormHeader />
        <div className="flex-grow-1 overflow-auto">
          <div className="page-wrapper">
            <RecipeForm />
          </div>
        </div>
      </div>
    </RecipeDetailsProvider>
  );
}
