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
import RecipeListing from "devtools/components/recipes/RecipeListing";
import {
  Environment,
  useEnvironments,
  useSelectedEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import { RecipeV3 } from "devtools/types/recipes";
import { chunkBy } from "devtools/utils/helpers";
import NormandyAPI from "devtools/utils/normandyApi";
import { convertToV1Recipe } from "devtools/utils/recipes";

const normandy = browser.experiments.normandy;

interface RecipesPageProps {
  api: NormandyAPI;
  connectionStatus: boolean;
  environment: Environment;
  environmentKey: string;
  environments: Record<string, Environment>;
}

// Wrapped in a HOC and then exported as default
const RecipesPage: React.FC<RecipesPageProps> = ({
  environmentKey,
  api,
  connectionStatus,
}) => {
  const [currentPageRecipes, setCurrentPageRecipes] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);

  const [arbitraryRecipe, setArbitraryRecipe] = useState("");
  const [showWriteRecipes, setShowWriteRecipes] = useState(false);

  // Load recipes
  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await api.fetchRecipePage(pageNum, { ordering: "-id" });
      setCurrentPageRecipes(data.results);
      setCount(data.count);
      setLoading(false);
    })();
  }, [pageNum, environmentKey, connectionStatus]);

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
        <RecipeList
          copyRecipeToArbitrary={copyRecipeToArbitrary}
          environmentKey={environmentKey}
          loading={loading}
          recipes={currentPageRecipes}
        />
        <div>
          <Pagination
            boundaryLinks
            ellipsis
            next
            prev
            activePage={pageNum}
            maxButtons={5}
            pages={Math.ceil(count / 25)}
            size="lg"
            onSelect={setPageNum}
          />
        </div>
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
  const {
    connectionStatus,
    environment,
    selectedKey,
  } = useSelectedEnvironmentState();
  const environments = useEnvironments();
  const api = useSelectedNormandyEnvironmentAPI();
  return (
    <RecipesPage
      api={api}
      connectionStatus={connectionStatus as boolean}
      environment={environment}
      environmentKey={selectedKey}
      environments={environments}
    />
  );
};

export default WrappedRecipePage;

const RecipeList: React.FC<{
  loading: boolean;
  recipes: Array<RecipeV3>;
  copyRecipeToArbitrary: (recipe: RecipeV3) => void;
  environmentKey: string;
}> = ({ loading, recipes, copyRecipeToArbitrary, environmentKey }) => {
  if (loading) {
    return (
      <div className="text-center">
        <Loader content="Loading recipes&hellip;" />
      </div>
    );
  } else if (recipes) {
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
  }

  return null;
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
      onClick={() => normandy.standardRun()}
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
      await normandy.runRecipe(JSON.parse(arbitraryRecipe));
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
