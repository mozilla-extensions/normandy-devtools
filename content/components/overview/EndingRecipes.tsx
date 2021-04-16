import dayjs from "dayjs";
import React from "react";

import CollapsibleSection from "devtools/components/common/CollapsibleSection";
import DisableRecipeButton from "devtools/components/recipes/DisableRecipeButton";
import RecipeCard from "devtools/components/recipes/RecipeCard";
import { RecipeV3 } from "devtools/types/recipes";

export const EndingRecipes: React.FC<{
  data: Array<{ endDate: number; recipe: RecipeV3 }>;
}> = ({ data }) => {
  const sevenDaysFuture = new Date();
  sevenDaysFuture.setDate(sevenDaysFuture.getDate() + 7);

  const endingRecipes = data
    .filter(({ endDate }) => new Date(endDate) <= sevenDaysFuture)
    .sort((e1, e2) => e1.endDate - e2.endDate);

  let endingSoonList = (
    <span className="text-subtle">There is nothing ending soon.</span>
  );
  if (endingRecipes.length) {
    endingSoonList = (
      <div className="grid-layout grid-3 card-grid">
        {endingRecipes.map((d) => (
          <EndingRecipeCard key={d.recipe.id} data={d} />
        ))}
      </div>
    );
  }

  return (
    <CollapsibleSection title={<h6>Ending Soon</h6>}>
      <div className="pl-4 mt-4">{endingSoonList}</div>
    </CollapsibleSection>
  );
};

const EndingRecipeCard: React.FC<{
  data: { endDate: number; recipe: RecipeV3 };
}> = ({ data: { endDate, recipe } }) => {
  const endingDate = dayjs(endDate);
  return (
    <RecipeCard recipe={recipe}>
      <div className="flex-grow-1" />
      <div>
        <div className="mt-2">
          <div className="font-weight-bold">Experimenter End Date</div>
          <span className="text-subtle">
            {endingDate.format("D MMMM YYYY")}
          </span>
        </div>
      </div>
      <div className="pt-2">
        <DisableRecipeButton
          postDispatch={false}
          recipe={recipe.approved_revision}
          recipeId={recipe.id}
        />
      </div>
    </RecipeCard>
  );
};
