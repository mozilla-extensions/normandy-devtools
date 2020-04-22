import React from "react";
import { useParams } from "react-router-dom";

import { RecipeFormProvider } from "devtools/contexts/recipeForm";
import {
  useSelectedExperimenterEnvironmentAPI,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import RecipeForm from "devtools/components/recipes/form/RecipeForm";

export default function RecipeFormPage() {
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
      experimenterApi
        .fetchRecipe(experimenterSlug)
        .then(({ comment, ...recipeData }) => {
          setData(recipeData);
          setImportInstructions(comment);
        });
    } else {
      setData({});
      setImportInstructions("");
    }
  }, [recipeId, experimenterSlug]);

  let title = "Create Recipe";
  if (recipeId) {
    title = "Edit Recipe";
  } else if (experimenterSlug) {
    title = "Import Recipe";
  }

  return (
    <div className="page-wrapper">
      <h4>{title}</h4>
      <RecipeFormProvider data={data} importInstructions={importInstructions}>
        <RecipeForm />
      </RecipeFormProvider>
    </div>
  );
}
