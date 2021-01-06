import dayjs from "dayjs";
import React from "react";
import { Alert, Icon, IconButton } from "rsuite";

import CollapsibleSection from "devtools/components/common/CollapsibleSection";
import RecipeCard from "devtools/components/recipes/RecipeCard";
import { useSelectedNormandyEnvironmentAPI } from "devtools/contexts/environment";
import { RecipeV3 } from "devtools/types/recipes";

export const PausingRecipes: React.FC<{
  data: Array<{ pauseDate: number; recipe: RecipeV3 }>;
}> = ({ data }) => {
  const sevenDaysFuture = new Date();
  sevenDaysFuture.setDate(sevenDaysFuture.getDate() + 7);

  const pausingRecipes = data
    .filter((recipeData) => {
      const pausingDate = new Date(recipeData.pauseDate);
      return pausingDate <= sevenDaysFuture;
    })
    .sort((exp1, exp2) => {
      return exp1.pauseDate - exp2.pauseDate;
    });

  let pausingList = (
    <span className="text-subtle">There is nothing pausing soon.</span>
  );
  if (pausingRecipes.length) {
    pausingList = (
      <div className="grid-layout grid-3 card-grid">
        {pausingRecipes.map((d) => (
          <PausingRecipeCard key={d.recipe.id} data={d} />
        ))}
      </div>
    );
  }

  return (
    <CollapsibleSection title={<h6>Pausing Soon</h6>}>
      <div className="pl-4 mt-4">{pausingList}</div>
    </CollapsibleSection>
  );
};

const PausingRecipeCard: React.FC<{
  data: { pauseDate: number; recipe: RecipeV3 };
}> = ({ data: { pauseDate, recipe } }) => {
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const normandyApi = useSelectedNormandyEnvironmentAPI();

  const handlePauseClick = async (): Promise<void> => {
    setIsButtonLoading(true);
    try {
      const updatedData = await normandyApi.patchRecipe(recipe.id, {
        comment: "One-click pause",
        arguments: {
          ...recipe.latest_revision.arguments,
          isEnrollmentPaused: true,
        },
      });

      await normandyApi.requestApproval(updatedData.latest_revision.id);
    } catch (err) {
      console.warn(err.message, err.data);
      Alert.error(`An Error Occurred: ${err.message}`, 5000);
    } finally {
      setIsButtonLoading(false);
    }
  };

  const pausingDate = dayjs(pauseDate);
  return (
    <RecipeCard recipe={recipe}>
      <div className="flex-grow-1" />
      <div>
        <div className="mt-2">
          <div className="font-weight-bold">Experimenter End Date</div>
          <span className="text-subtle">
            {pausingDate.format("D MMMM YYYY")}
          </span>
        </div>
      </div>
      <div className="pt-2">
        <IconButton
          color="yellow"
          icon={<Icon icon="close-circle" />}
          loading={isButtonLoading}
          onClick={handlePauseClick}
        >
          Pause
        </IconButton>
      </div>
    </RecipeCard>
  );
};
