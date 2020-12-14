import React from "react";
import { Loader } from "rsuite";

import PageWrapper from "devtools/components/common/PageWrapper";
import { EndingRecipes } from "devtools/components/overview/EndingRecipes";
import { PausingRecipes } from "devtools/components/overview/PausingRecipes";
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
  const [pauseRecipes, setPauseRecipes] = React.useState([]);
  React.useEffect(() => {
    getPendingReviews();
    getExperimenterInfo();
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

  const getExperimenterInfo = async (): Promise<void> => {
    try {
      const experiments = await experimenterApi.fetchExperiments({
        status: "Live",
      });

      await getEndingRecipes(experiments);
      await getPausingExperiments(experiments);
    } catch (e) {
      console.warn(e);
      setLiveRecipes([]);
      setPauseRecipes([]);
    }
  };

  const getEndingRecipes = async (experiments): Promise<void> => {
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

  const getPausingExperiments = async (experiments): Promise<void> => {
    const newPauseRecipes = (
      await Promise.all(
        experiments.map(async (experiment) => {
          if (experiment.normandy_id && experiment.proposed_enrollment) {
            const recipe = await normandyApi.fetchRecipe(
              experiment.normandy_id,
            );
            if (!recipe.latest_revision.arguments.isEnrollmentPaused) {
              const pauseDate = new Date(experiment.start_date);
              pauseDate.setDate(
                pauseDate.getDate() + experiment.proposed_enrollment,
              );

              return [{ pauseDate: pauseDate.getTime(), recipe }];
            }
          }

          return [];
        }),
      )
    ).flat();

    setPauseRecipes(newPauseRecipes);
  };

  if (recipes.length || liveRecipes.length || pauseRecipes.length) {
    return (
      <PageWrapper>
        <PendingReviews data={recipes} />
        <EndingRecipes data={liveRecipes} />
        <PausingRecipes data={pauseRecipes} />
      </PageWrapper>
    );
  }

  return (
    <div className="text-center">
      <Loader content="Loading Overview&hellip;" />
    </div>
  );
};
