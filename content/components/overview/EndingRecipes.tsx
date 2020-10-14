import React, { ReactElement } from "react";
import { Link } from "react-router-dom";
import { Alert, Col, Icon, IconButton, Panel, Row, Tag } from "rsuite";

import { useSelectedNormandyEnvironmentAPI } from "devtools/contexts/environment";
import { RecipeV3 } from "devtools/types/recipes";
import { chunkBy } from "devtools/utils/helpers";

export const EndingRecipes: React.FC<{
  data: Array<{ endDate: number; recipe: RecipeV3 }>;
}> = ({ data }) => {
  const sevenDaysFuture = new Date();
  sevenDaysFuture.setDate(sevenDaysFuture.getDate() + 7);

  const renderEndingSoonListItem = (): Array<ReactElement> => {
    const endingRecipes = data.filter((recipeData) => {
      const endingDate = new Date(recipeData.endDate);
      return endingDate <= sevenDaysFuture;
    });
    endingRecipes.sort((exp1, exp2) => {
      return exp1.endDate - exp2.endDate;
    });
    return chunkBy(endingRecipes, 3).map((recipeChunk, rowIdx) => {
      return (
        <Row key={rowIdx}>
          {recipeChunk.map((recipeData, colIdx) => {
            return (
              <Col key={`col-${colIdx}`} md={8} sm={24}>
                <EndingRecipeCard recipeData={recipeData} />
              </Col>
            );
          })}
        </Row>
      );
    });
  };

  return (
    <>
      <h3>Ending Recipes</h3>
      {renderEndingSoonListItem()}
    </>
  );
};

const EndingRecipeCard: React.FC<{
  recipeData: { endDate: number; recipe: RecipeV3 };
}> = ({ recipeData }) => {
  const { endDate, recipe } = recipeData;
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const normandyApi = useSelectedNormandyEnvironmentAPI();

  const handleDisableClick = async (): Promise<void> => {
    setIsButtonLoading(true);
    try {
      await normandyApi.disableRecipe(recipe.id);
      Alert.success("Recipe Successfully disabled");
    } catch (err) {
      console.warn(err.message, err.data);
      Alert.error(`An Error Occurred: ${JSON.stringify(err.message)}`, 5000);
    } finally {
      setIsButtonLoading(false);
    }
  };

  const endingDate = new Date(endDate);
  return (
    <Panel
      bordered
      className="recipe-listing mb-2"
      header={<CardHeader recipe={recipe} />}
    >
      <div className="d-flex flex-wrap m-0">
        <div className="flex-grow-1">
          <p>Experimenter End Date: </p>
          {endingDate.toLocaleDateString()}
        </div>

        <IconButton
          className="ml-1"
          color="red"
          disabled={!recipe.latest_revision.enabled}
          icon={<Icon icon="close-circle" />}
          loading={isButtonLoading}
          onClick={handleDisableClick}
        >
          Disable
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
