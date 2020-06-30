import React from "react";
import { useParams } from "react-router-dom";

import DetailsHeader from "devtools/components/recipes/details/DetailsHeader";
import RecipeDetails from "devtools/components/recipes/details/RecipeDetails";
import { useSelectedNormandyEnvironmentAPI } from "devtools/contexts/environment";
import { RecipeDetailsProvider } from "devtools/contexts/recipeDetails";

export default function RecipeDetailsPage() {
  const { recipeId } = useParams();
  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const [data, setData] = React.useState({});

  React.useEffect(() => {
    normandyApi.fetchRecipe(recipeId).then((recipeData) => {
      setData(recipeData.latest_revision);
    });
  }, [recipeId, normandyApi.getBaseUrl({ method: "GET" })]);

  return (
    <RecipeDetailsProvider data={data}>
      <div className="d-flex flex-column h-100">
        <DetailsHeader />
        <div className="flex-grow-1 overflow-auto">
          <div className="page-wrapper">
            <RecipeDetails />
          </div>
        </div>
      </div>
    </RecipeDetailsProvider>
  );
}
