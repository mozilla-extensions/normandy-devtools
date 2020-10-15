import React, { ReactElement } from "react";
import { Link } from "react-router-dom";
import { Alert, Col, Icon, IconButton, Panel, Row, Tag } from "rsuite";

import { useSelectedNormandyEnvironmentAPI } from "devtools/contexts/environment";
import { RecipeV3 } from "devtools/types/recipes";
import { chunkBy } from "devtools/utils/helpers";

export const PausingRecipes: React.FC<{
  data: Array<{ pauseDate: number; recipe: RecipeV3 }>;
}> = ({ data }) => {
  const sevenDaysFuture = new Date();
  sevenDaysFuture.setDate(sevenDaysFuture.getDate() + 7);

  const renderPausingSoonListItem = (): Array<ReactElement> => {
    const pausingRecipes = data.filter((recipeData) => {
      const pausingDate = new Date(recipeData.pauseDate);
      return pausingDate <= sevenDaysFuture;
    });
    pausingRecipes.sort((exp1, exp2) => {
      return exp1.pauseDate - exp2.pauseDate;
    });
    return chunkBy(pausingRecipes, 3).map((recipeChunk, rowIdx) => {
      return (
        <Row key={rowIdx}>
          {recipeChunk.map((recipeData, colIdx) => {
            return (
              <Col key={`col-${colIdx}`} md={8} sm={24}>
                <PausingRecipeCard recipeData={recipeData} />
              </Col>
            );
          })}
        </Row>
      );
    });
  };

  return (
    <>
      <h3>Pausing Recipes</h3>
      {renderPausingSoonListItem()}
    </>
  );
};

const PausingRecipeCard: React.FC<{
  recipeData: { pauseDate: number; recipe: RecipeV3 };
}> = ({ recipeData }) => {
  const { pauseDate, recipe } = recipeData;
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

  const pausingDate = new Date(pauseDate);

  return (
    <Panel
      bordered
      className="recipe-listing mb-2"
      header={<CardHeader recipe={recipe} />}
    >
      <div className="d-flex flex-wrap m-0">
        <div className="flex-grow-1">
          <p>Experimenter Pause Date: </p>
          {pausingDate.toLocaleDateString()}
        </div>

        <IconButton
          className="ml-1"
          color="yellow"
          icon={<Icon icon="close-circle" />}
          loading={isButtonLoading}
          onClick={handlePauseClick}
        >
          Pause
        </IconButton>
      </div>
    </Panel>
  );
};

const CardHeader: React.FC<{ recipe: RecipeV3 }> = ({
  recipe,
}): ReactElement => {
  return (
    <>
      <Link to={`recipes/${recipe.id}`}>
        <Tag className="mr-half" color="violet">
          {recipe.id}
        </Tag>
      </Link>
      <Link
        style={{ textDecoration: "inherit", color: "inherit" }}
        to={`recipes/${recipe.id}`}
      >
        {recipe.latest_revision.name}
      </Link>
    </>
  );
};
