import React from "react";
import { useParams } from "react-router-dom";

import DetailsHeader from "devtools/components/recipes/details/DetailsHeader";
import RecipeDetails from "devtools/components/recipes/details/RecipeDetails";
import { useSelectedNormandyEnvironmentAPI } from "devtools/contexts/environment";
import { ExperimenterDetailsProvider } from "devtools/contexts/experimenterDetails";
import { RecipeDetailsProvider } from "devtools/contexts/recipeDetails";

export default function RecipeDetailsPage() {
  const { recipeId } = useParams();
  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const [recipeData, setRecipeData] = React.useState({});
  const [experimenterData, setExperimenterData] = React.useState({});

  React.useEffect(() => {
    normandyApi.fetchRecipe(recipeId).then((recipeData) => {
      setRecipeData(recipeData.latest_revision);
    });
  }, [recipeId, normandyApi.getBaseUrl({ method: "GET" })]);

  React.useEffect(() => {
    const { experimenter_slug } = recipeData;
    fetch(`https://experimenter.services.mozilla.com/api/v1/experiments/${experimenter_slug}`)
      .then((resp) => resp.json())
      .then((data) => {
        setExperimenterData(data);
      });
  }, [recipeData]);

  return (
    <RecipeDetailsProvider data={recipeData}>
      <ExperimenterDetailsProvider data={experimenterData}>
        <div className="d-flex flex-column h-100">
          <DetailsHeader />
          <div className="flex-grow-1 overflow-auto">
            <div className="page-wrapper">
              <RecipeDetails />
            </div>
          </div>
        </div>
      </ExperimenterDetailsProvider>
    </RecipeDetailsProvider>
  );
}
