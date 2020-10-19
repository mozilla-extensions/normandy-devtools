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

// export default
const RecipeDetailsPage: React.FC = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const experimenterApi = useSelectedExperimenterEnvironmentAPI();
  const [recipeData, setRecipeData] = React.useState({
    experimenter_slug: null,
  });
  const [recipeStatusData, setRecipeStatusData] = React.useState(null);
  const [experimenterData, setExperimenterData] = React.useState(null);

  React.useEffect(() => {
    normandyApi.fetchRecipe(recipeId).then((recipeData) => {
      setRecipeData(recipeData.latest_revision);
      setRecipeStatusData(recipeData.approved_revision);
    });
  }, [recipeId, normandyApi.getBaseUrl({ method: "GET" })]);

  React.useEffect(() => {
    const { experimenter_slug } = recipeData;
    if (!experimenter_slug) {
      return;
    }

    experimenterApi.fetchExperiment(experimenter_slug).then((data) => {
      const proposedStartDate = new Date(data.proposed_start_date);
      const proposedEndDate = new Date();
      proposedEndDate.setTime(proposedStartDate.getTime());
      proposedEndDate.setUTCDate(
        proposedStartDate.getUTCDate() + data.proposed_duration,
      );

      setExperimenterData({
        publicDescription: data.public_description,
        proposedStartDate,
        proposedDuration: data.proposed_duration,
        proposedEndDate,
        startDate: data.start_date && new Date(data.start_date),
        endDate: data.end_date && new Date(data.end_date),
        variants: data.variants.reduce((acc, v) => {
          acc[v.slug] = v.description;
          return acc;
        }, {}),
      });
    });
  }, [recipeData]);

  return (
    <RecipeDetailsProvider data={recipeData} statusData={recipeStatusData}>
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
};

export default RecipeDetailsPage;
