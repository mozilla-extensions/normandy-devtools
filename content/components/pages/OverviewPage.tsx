import React from "react";
import { Loader } from "rsuite";

import { EndingRecipes } from "devtools/components/overview/EndingRecipes";
import { PendingReviews } from "devtools/components/overview/PendingReviews";
import {
  useEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
  useSelectedExperimenterEnvironmentAPI,
} from "devtools/contexts/environment";

export const OverviewPage: React.FC = () => {
  const { selectedKey: environmentKey } = useEnvironmentState();

  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const experimenterApi = useSelectedExperimenterEnvironmentAPI();

  const [recipes, setRecipes] = React.useState([]);
  const [liveRecipes, setLiveRecipes] = React.useState([]);
  React.useEffect(() => {
    getPendingReviews();
    getLiveExperiments();
  }, [environmentKey]);

  const getPendingReviews = async (): Promise<void> => {
    const approvalRequests = await normandyApi.fetchApprovalRequests({
      approved: "pending",
    });

    const recipeList = [];

    if (approvalRequests.length) {
      await Promise.all(
        approvalRequests.map(async (approvalRequest) => {
          const {
            revision: { recipe_id },
          } = approvalRequest;
          const recipe = await normandyApi.fetchRecipe(recipe_id);
          recipeList.push(recipe);
        }),
      );
    }

    setRecipes(recipeList);
  };

  const getLiveExperiments = async (): Promise<void> => {
    const experiments = await experimenterApi.fetchExperiments({
      status: "Live",
    });

    const newLiveRecipes = (
      await Promise.all(
        experiments.map(async (experiment) => {
          if (experiment.normandy_id) {
            const recipe = await normandyApi.fetchRecipe(
              experiment.normandy_id,
            );
            return [{ endDate: experiment.end_date, recipe }];
          }

          return [];
        }),
      )
    ).flat();

    setLiveRecipes(newLiveRecipes);
  };

  if (recipes.length || liveRecipes.length) {
    return (
      <div className="page-wrapper">
        <PendingReviews data={recipes} />
        <EndingRecipes data={liveRecipes} />
      </div>
    );
  }

  return (
    <div className="text-center">
      <Loader content="Loading Overview&hellip;" />
    </div>
  );
};
