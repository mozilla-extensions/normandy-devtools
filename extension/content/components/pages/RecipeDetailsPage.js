import React from "react";
import { useParams } from "react-router-dom";

import DetailsHeader from "devtools/components/recipes/details/DetailsHeader";
import RecipeDetails from "devtools/components/recipes/details/RecipeDetails";
import {
  useSelectedNormandyEnvironmentAPI,
  useSelectedExperimenterEnvironmentAPI,
} from "devtools/contexts/environment";
import { ExperimenterDetailsProvider } from "devtools/contexts/experimenterDetails";
import { RecipeDetailsProvider } from "devtools/contexts/recipeDetails";

export default function RecipeDetailsPage() {
  const { recipeId } = useParams();
  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const experimenterApi = useSelectedExperimenterEnvironmentAPI();
  const [recipeData, setRecipeData] = React.useState({
    experimenter_slug: "",
  });
  const [experimenterData, setExperimenterData] = React.useState({});

  React.useEffect(() => {
    normandyApi.fetchRecipe(recipeId).then((recipeData) => {
      setRecipeData(recipeData.latest_revision);
    });
  }, [recipeId, normandyApi.getBaseUrl({ method: "GET" })]);

  React.useEffect(() => {
    const { experimenter_slug } = recipeData;
    if (!experimenter_slug) {
      return;
    }

    experimenterApi.fetchExperiment(experimenter_slug).then((data) => {
      setExperimenterData({
        publicDescription: data.public_description,
        proposedStartDate: new Date(data.proposed_start_date),
        proposedDuration: data.proposed_duration,
        variants: data.variants.map(({ description }) => description),
      });
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
