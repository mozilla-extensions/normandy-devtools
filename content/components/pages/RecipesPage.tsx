import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Header,
  Icon,
  Loader,
  Modal,
  Nav,
  Navbar,
  Pagination,
  Row,
  Col,
  Grid,
} from "rsuite";

import CodeMirror from "devtools/components/common/CodeMirror";
import RecipeQueryEditor from "devtools/components/recipes/details/RecipeQueryEditor";
import RecipeListing from "devtools/components/recipes/RecipeListing";
import {
  useSelectedEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import { RecipeListQuery } from "devtools/types/normandyApi";
import { RecipeV3 } from "devtools/types/recipes";
import { chunkBy } from "devtools/utils/helpers";
import NormandyAPI from "devtools/utils/normandyApi";
import { convertToV1Recipe } from "devtools/utils/recipes";

interface RecipesPageProps {
  api: NormandyAPI;
  connectionStatus: boolean;
  environmentKey: string;
}

// Wrapped in a HOC and then exported as default
const RecipesPage: React.FC<RecipesPageProps> = ({
  environmentKey,
  api,
  connectionStatus,
}) => {
  const [currentRecipes, setCurrentRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [recipeQuery, setRecipeQuery] = useState<RecipeListQuery>(null);

  const [arbitraryRecipe, setArbitraryRecipe] = useState("");
  const [showWriteRecipes, setShowWriteRecipes] = useState(false);

  // Load recipes
  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await api.fetchRecipePage({
        ordering: "-id",
        ...recipeQuery,
      });
      setCurrentRecipes(data.results);
      setCount(data.count);
      setLoading(false);
    })();
  }, [environmentKey, connectionStatus, recipeQuery, api]);

  function copyRecipeToArbitrary(v3Recipe): void {
    const v1Recipe = convertToV1Recipe(
      v3Recipe.latest_revision,
      environmentKey,
    );
    setArbitraryRecipe(JSON.stringify(v1Recipe, null, 2));
    setShowWriteRecipes(true);
  }

  return (
    <>
      <Header>
        <Navbar>
          <Nav pullRight>
            <Nav.Item
              componentClass={Link}
              icon={<Icon icon="edit" />}
              to={`/${environmentKey}/recipes/new`}
            >
              Create Recipe
            </Nav.Item>
            <Nav.Item
              icon={<Icon icon="edit" />}
              onClick={() => setShowWriteRecipes(true)}
            >
              Write & Run Arbitrary
            </Nav.Item>
            <RunButton environmentKey={environmentKey} />
          </Nav>
        </Navbar>
      </Header>

      <div className="page-wrapper">
        <RecipeQueryEditor
          className="ml-half mb-n1"
          normandyApi={api}
          query={recipeQuery}
          setQuery={setRecipeQuery}
        />
        {loading ? (
          <div className="text-center mt-4">
            <Loader content="Loading recipes&hellip;" />
          </div>
        ) : (
          <>
            <RecipeList
              copyRecipeToArbitrary={copyRecipeToArbitrary}
              environmentKey={environmentKey}
              recipes={currentRecipes}
            />
            <div>
              <Pagination
                boundaryLinks
                ellipsis
                next
                prev
                activePage={recipeQuery?.page ?? 1}
                maxButtons={5}
                pages={Math.ceil(count / 25)}
                size="lg"
                onSelect={(newPage) =>
                  setRecipeQuery((q) => ({ ...q, page: newPage }))
                }
              />
            </div>
          </>
        )}
      </div>

      <WriteRecipeModal
        arbitraryRecipe={arbitraryRecipe}
        setArbitraryRecipe={setArbitraryRecipe}
        setShowWriteRecipes={setShowWriteRecipes}
        showWriteRecipes={showWriteRecipes}
      />
    </>
  );
};

// export default
const WrappedRecipePage: React.FC = () => {
  const { connectionStatus, selectedKey } = useSelectedEnvironmentState();
  const api = useSelectedNormandyEnvironmentAPI();
  return (
    <RecipesPage
      api={api}
      connectionStatus={connectionStatus}
      environmentKey={selectedKey}
    />
  );
};

export default WrappedRecipePage;

const RecipeList: React.FC<{
  recipes: Array<RecipeV3>;
  copyRecipeToArbitrary: (recipe: RecipeV3) => void;
  environmentKey: string;
}> = ({ recipes, copyRecipeToArbitrary, environmentKey }) => {
  return (
    <Grid className="recipe-list">
      {chunkBy(recipes, 2).map((recipeChunk, rowIdx) => (
        <Row key={`row-${rowIdx}`}>
          {recipeChunk.map((recipe, colIdx) => (
            <Col key={`col-${colIdx}`} md={12} sm={24}>
              <RecipeListing
                key={recipe.id}
                copyRecipeToArbitrary={copyRecipeToArbitrary}
                environmentName={environmentKey}
                recipe={recipe}
              />
            </Col>
          ))}
        </Row>
      ))}
    </Grid>
  );
};

const RunButton: React.FC<{
  environmentKey: string;
}> = ({ environmentKey }) => {
  if (environmentKey !== "prod") {
    return null;
  }

  return (
    <Nav.Item
      icon={<Icon icon="play" />}
      onClick={() => browser.experiments.normandy.standardRun()}
    >
      Run Normandy
    </Nav.Item>
  );
};

const WriteRecipeModal: React.FC<{
  arbitraryRecipe: string;
  showWriteRecipes: boolean;
  setShowWriteRecipes: (show: boolean) => void;
  setArbitraryRecipe: (newRecipe: string) => void;
}> = ({
  arbitraryRecipe,
  setShowWriteRecipes,
  showWriteRecipes,
  setArbitraryRecipe,
}) => {
  const [runningArbitrary, setRunningArbitrary] = useState(false);

  async function runArbitraryRecipe(): Promise<void> {
    setRunningArbitrary(true);
    try {
      await browser.experiments.normandy.runRecipe(JSON.parse(arbitraryRecipe));
    } finally {
      setRunningArbitrary(false);
    }
  }

  return (
    <Modal
      show={showWriteRecipes}
      size="lg"
      onHide={() => setShowWriteRecipes(false)}
    >
      <Modal.Header>
        <Modal.Title>Write a recipe</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CodeMirror
          options={{
            mode: "javascript",
            lineNumbers: true,
          }}
          value={arbitraryRecipe}
          onBeforeChange={(editor, data, value) => setArbitraryRecipe(value)}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          appearance="primary"
          disabled={runningArbitrary}
          onClick={runArbitraryRecipe}
        >
          Run
        </Button>
        <Button appearance="subtle" onClick={() => setShowWriteRecipes(false)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
