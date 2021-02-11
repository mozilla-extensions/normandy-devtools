import React from "react";
import { useHistory } from "react-router";

import CollapsibleSection from "devtools/components/common/CollapsibleSection";
import RecipeCard from "devtools/components/recipes/RecipeCard";
import { useEnvironmentState } from "devtools/contexts/environment";
import { RecipeV3 } from "devtools/types/recipes";

const PendingReviews: React.FC<{ data: Array<RecipeV3> }> = ({ data }) => {
  const environmentState = useEnvironmentState();
  const history = useHistory();

  const pendingReviews = data
    .filter(
      (recipe) => recipe.latest_revision.approval_request?.approved === null,
    )
    .sort(
      (r1, r2) =>
        new Date(r1.latest_revision.approval_request.created).getTime() -
        new Date(r2.latest_revision.approval_request.created).getTime(),
    );

  let pendingReviewList = (
    <span className="text-subtle">There is nothing pending review.</span>
  );

  if (pendingReviews.length) {
    pendingReviewList = (
      <div className="grid-layout grid-3 card-grid">
        {pendingReviews.map((recipe) => {
          const handleClick = (): void => {
            history.push(
              `/${environmentState.selectedKey}/recipes/${recipe.id}`,
            );
          };

          return (
            <RecipeCard
              key={recipe.id}
              className="cursor-pointer"
              recipe={recipe}
              onClick={handleClick}
            />
          );
        })}
      </div>
    );
  }

  return (
    <CollapsibleSection title={<h6>Pending Reviews</h6>}>
      <div className="pl-4 mt-4">{pendingReviewList}</div>
    </CollapsibleSection>
  );
};

export default PendingReviews;
