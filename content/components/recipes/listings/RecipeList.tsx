import React from "react";
import { useHistory } from "react-router";
import { IconButton, Divider, Tag, Icon, Popover, Whisper } from "rsuite";

import SuitabilityTag from "devtools/components/recipes/details/SuitabilityTag";
import EnabledTag from "devtools/components/recipes/EnabledTag";
import RecipeCard from "devtools/components/recipes/RecipeCard";
import { layoutContext } from "devtools/contexts/layout";
import { RecipeV3 } from "devtools/types/recipes";
import { has } from "devtools/utils/helpers";
import { convertToV1Recipe } from "devtools/utils/recipes";

interface RecipeListProps {
  recipes: Array<RecipeV3>;
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

interface CardProps {
  recipe: RecipeV3;
  copyRecipeToArbitrary: (recipe: RecipeV3) => void;
  environmentKey: string;
}

const Card: React.FC<CardProps> = ({
  recipe,
  copyRecipeToArbitrary,
  environmentKey,
}) => {
  const history = useHistory();
  const [running, setRunning] = React.useState(false);
  const { container } = React.useContext(layoutContext);

  const handleEditClick = (): void => {
    history.push(`/${environmentKey}/recipes/${recipe.id}/`);
  };

  const handleCustomRunButtonClick = (): void => {
    copyRecipeToArbitrary(recipe);
  };

  const handleRunButtonClick = async (): Promise<void> => {
    if (!running) {
      setRunning(true);
      await browser.experiments.normandy.runRecipe(
        convertToV1Recipe(recipe.latest_revision, environmentKey),
      );
      setRunning(false);
    }
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

  const moreButton = (
    <div>
      <Whisper
        placement="bottomEnd"
        speaker={
          <Popover container={container}>
            <ul className="link-list border-top-0 mt-0">
              <li onClick={handleEditClick}>
                <Icon className="mr-1" icon="pencil" />
                Edit
              </li>
              {__ENV__ === "extension" ? (
                <li onClick={handleRunButtonClick}>
                  <Icon
                    className="mr-1"
                    icon={running ? "spinner" : "play"}
                    spin={running}
                  />
                  Run
                </li>
              ) : null}
              {__ENV__ === "extension" ? (
                <li onClick={handleCustomRunButtonClick}>
                  <Icon className="mr-1" icon="gear" />
                  Customize & Run
                </li>
              ) : null}
            </ul>
          </Popover>
        }
        trigger="click"
      >
        <IconButton
          appearance="primary"
          icon={<Icon icon="ellipsis-h" />}
          size="sm"
        />
      </Whisper>
    </div>
  );

  return (
    <RecipeCard afterHeader={moreButton} className="mb-1" recipe={recipe}>
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
          <EnabledTag revision={recipe.latest_revision} />
        </span>
      </div>
      {metaData.length ? (
        <>
          <Divider className="mt-2 mb-0" />
          <div className="flex-grow-1">{metaData}</div>
        </>
      ) : null}
    </RecipeCard>
  );
};

export default RecipeList;
