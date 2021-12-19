import React from "react";
import { useParams } from "react-router-dom";

import PageWrapper from "devtools/components/common/PageWrapper";
import NotFoundPage from "devtools/components/pages/NotFoundPage";
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
  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const experimenterApi = useSelectedExperimenterEnvironmentAPI();
  const [recipeData, setRecipeData] = React.useState({
    experimenter_slug: null,
  });
  const [recipeStatusData, setRecipeStatusData] = React.useState(null);
  const [experimenterData, setExperimenterData] = React.useState(null);

  const { recipeId } = useParams<{ recipeId: string }>();
  const [errorPage, setErrorPage] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const recipeIdParsed = parseInt(recipeId);
      if (isNaN(recipeIdParsed)) {
        setErrorPage(
          <NotFoundPage>
            Recipe ID <code>{JSON.stringify(recipeId)}</code> is not valid
          </NotFoundPage>,
        );
        setRecipeData(null);
        setRecipeStatusData(null);
        return;
      }

      const recipeData = await normandyApi.fetchRecipe(recipeIdParsed);
      if (!mounted) {
        return;
      }

      setRecipeData(recipeData.latest_revision);
      setRecipeStatusData(recipeData.approved_revision);
    })();

    return () => {
      mounted = false;
    };
  }, [recipeId, normandyApi.getBaseUrl({ method: "GET" })]);

  React.useEffect(() => {
    if (!recipeData?.experimenter_slug) {
      return;
    }

    const { experimenter_slug } = recipeData;

    experimenterApi.fetchExperiment(experimenter_slug).then((data) => {
      const proposedStartDate = new Date(data.proposed_start_date);
      const proposedEndDate = new Date();
      proposedEndDate.setTime(proposedStartDate.getTime());
      proposedEndDate.setUTCDate(
        proposedStartDate.getUTCDate() + data.proposed_duration,
      );

      setExperimenterData({
        normandySlug: data.normandy_slug,
        publicDescription: data.public_description,
        proposedStartDate,
        proposedDuration: data.proposed_duration,
        proposedEndDate,
        startDate: data.start_date && new Date(data.start_date),
        status: data.status && data.status.toLowerCase(),
        endDate: data.end_date && new Date(data.end_date),
        variants: data.variants.reduce((acc, v) => {
          acc[v.slug] = v.description;
          return acc;
        }, {}),
      });
    });
  }, [recipeData?.experimenter_slug]);

  if (errorPage) {
    return errorPage;
  }

  return (
    <RecipeDetailsProvider data={recipeData} statusData={recipeStatusData}>
      <ExperimenterDetailsProvider data={experimenterData}>
        <div className="d-flex flex-column h-100">
          <DetailsHeader />
          <div className="flex-grow-1 overflow-auto">
            <PageWrapper>
              <RecipeDetails />
            </PageWrapper>
          </div>
        </div>
      </ExperimenterDetailsProvider>
    </RecipeDetailsProvider>
  );
};

export default RecipeDetailsPage;
