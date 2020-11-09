import React from "react";
import { useHistory } from "react-router";
import { IconButton, Divider, Tag, Icon } from "rsuite";

import SuitabilityTag from "devtools/components/recipes/details/SuitabilityTag";
import RecipeCard from "devtools/components/recipes/RecipeCard";
import { RecipeV3 } from "devtools/types/recipes";
import { has } from "devtools/utils/helpers";
import { convertToV1Recipe } from "devtools/utils/recipes";

interface RecipeListProps {
  recipes: Array<RecipeV3>;
  copyRecipeToArbitrary: (recipe: RecipeV3) => void;
  environmentKey: string;
}

interface CardProps {
  recipe: RecipeV3;
  copyRecipeToArbitrary: (recipe: RecipeV3) => void;
  environmentKey: string;
}

const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  copyRecipeToArbitrary,
  environmentKey,
}) => {
  return (
    <div className="grid-layout grid-2 card-grid">
      {recipes.map((recipe) => (
        <Card
          key={recipe.id}
          copyRecipeToArbitrary={copyRecipeToArbitrary}
          environmentKey={environmentKey}
          recipe={recipe}
        />
      ))}
    </div>
  );
};

const Card: React.FC<CardProps> = ({
  recipe,
  copyRecipeToArbitrary,
  environmentKey,
}) => {
  const history = useHistory();
  const [running, setRunning] = React.useState(false);

  let enabledTag = <Tag color="red">Disabled</Tag>;
  if (recipe.latest_revision.enabled) {
    enabledTag = <Tag color="green">Enabled</Tag>;
  }

  const handleEditClick = (): void => {
    history.push(`/${environmentKey}/recipes/${recipe.id}/`);
  };

  const handleCustomRunButtonClick = (): void => {
    copyRecipeToArbitrary(recipe);
  };

  const handleRunButtonClick = async (): Promise<void> => {
    setRunning(true);
    await browser.experiments.normandy.runRecipe(
      convertToV1Recipe(recipe.latest_revision, environmentKey),
    );
    setRunning(false);
  };

  const metaDataKeys = ["slug", "surveyId", "rolloutSlug"];
  const metaData = [];
  metaDataKeys.forEach((k) => {
    if (has(k, recipe.latest_revision.arguments)) {
      metaData.push(
        <div key={k} className="mt-2">
          <div className="font-weight-bold">{k}</div>
          <div className="text-subtle font-family-monospace">
            {recipe.latest_revision.arguments[k]}
          </div>
        </div>,
      );
    }
  });

  return (
    <RecipeCard className="mb-1" recipe={recipe}>
      <Divider className="mb-2 mt-2" />
      <div className="d-flex pb-half">
        <span className="flex-grow-1">
          <Tag>{recipe.latest_revision.action.name}</Tag>
        </span>
        <span className="text-right">
          {__ENV__ === "extension" && (
            <SuitabilityTag
              hide={["RECIPE_SUITABILITY_FILTER_MISMATCH"]}
              revision={recipe.latest_revision}
            />
          )}
          {enabledTag}
        </span>
      </div>
      <Divider className="mt-2 mb-0" />
      <div className="flex-grow-1">{metaData}</div>
      <Divider className="my-2" />
      <div className="grid-layout grid-3">
        <IconButton icon={<Icon icon="pencil" />} onClick={handleEditClick}>
          Edit
        </IconButton>
        <IconButton
          disabled={__ENV__ !== "extension"}
          icon={<Icon icon="play" />}
          loading={running}
          onClick={handleRunButtonClick}
        >
          Run
        </IconButton>
        <IconButton
          disabled={__ENV__ !== "extension"}
          icon={<Icon icon="gear" />}
          onClick={handleCustomRunButtonClick}
        >
          Customize & Run
        </IconButton>
      </div>
    </RecipeCard>
  );
};

export default RecipeList;
