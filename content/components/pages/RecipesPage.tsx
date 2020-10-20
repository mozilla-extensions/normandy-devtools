import autobind from "autobind-decorator";
import PropTypes from "prop-types";
import React, { ReactElement } from "react";
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

interface Props {
  api: NormandyAPI;
  connectionStatus: boolean;
  environment: Environment;
  environmentKey: string;
  environments: Record<string, Environment>;
}

interface State {
  arbitraryRecipe: string;
  count: number;
  loading: boolean;
  page: number;
  runningArbitrary: boolean;
  showWriteRecipes: boolean;
  recipeSelected: boolean;
  recipePages: Record<string, Record<number, Array<RecipeV3>>>;
}

@autobind
class RecipesPage extends React.PureComponent<Props, State> {
  static propTypes = {
    api: PropTypes.object,
    connectionStatus: PropTypes.bool,
    environment: PropTypes.object,
    environmentKey: PropTypes.string,
    environments: PropTypes.object,
  };

  constructor(props) {
    super(props);

    const recipePages = {};
    Object.keys(props.environments).forEach((v) => {
      recipePages[v] = {};
    });

    this.state = {
      arbitraryRecipe: "",
      count: 0,
      loading: false,
      page: 1,
      runningArbitrary: false,
      showWriteRecipes: false,
      recipeSelected: false,
      recipePages,
    };
  }

  async runNormandy(): Promise<void> {
    await normandy.standardRun();
  }

  async componentDidMount(): Promise<void> {
    const { page } = this.state;
    const { environment } = this.props;
    this.refreshRecipeList(environment, page);
  }

  async componentDidUpdate(prevProps): Promise<void> {
    const { connectionStatus, environmentKey, environment } = this.props;
    if (
      environmentKey !== prevProps.environmentKey ||
      connectionStatus !== prevProps.connectionStatus
    ) {
      this.refreshRecipeList(environment, this.state.page);
    }
  }

  async refreshRecipeList(environment, page): Promise<void> {
    const { api, environmentKey } = this.props;
    if (
      environmentKey in this.state.recipePages &&
      page in this.state.recipePages[environmentKey]
    ) {
      // cache hit
      this.setState({ page });
      return;
    }

    // cache miss
    this.setState({ loading: true });
    const data = await api.fetchRecipePage(page, {
      ordering: "-id",
    });

    this.setState(({ recipePages }) => ({
      recipePages: {
        ...recipePages,
        [environmentKey]: {
          ...recipePages[environmentKey],
          [page]: data.results,
        },
      },
      page,
      loading: false,
      count: data.count,
    }));
  }

  handlePageChange(page): void {
    const { environment } = this.props;
    this.refreshRecipeList(environment, page);
  }

  copyRecipeToArbitrary(v3Recipe): void {
    const { environmentKey } = this.props;
    const v1Recipe = convertToV1Recipe(
      v3Recipe.latest_revision,
      environmentKey,
    );
    this.setState({
      arbitraryRecipe: JSON.stringify(v1Recipe, null, 2),
      showWriteRecipes: true,
    });
  }

  renderRecipeList(): ReactElement {
    const { loading, page, recipePages } = this.state;
    const { environmentKey } = this.props;
    const { [environmentKey]: { [page]: recipes = [] } = {} } = recipePages;
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
                    copyRecipeToArbitrary={this.copyRecipeToArbitrary}
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
  }

  showWriteRecipePopup(): void {
    this.setState({ showWriteRecipes: true });
  }

  hideWriteRecipePopup(): void {
    this.setState({ showWriteRecipes: false });
  }

  handleArbitraryRecipeChange(editor, data, value): void {
    this.setState({ arbitraryRecipe: value });
  }

  async runArbitraryRecipe(): Promise<void> {
    const { arbitraryRecipe } = this.state;
    this.setState({ runningArbitrary: true });
    try {
      await normandy.runRecipe(JSON.parse(arbitraryRecipe));
    } finally {
      this.setState({ runningArbitrary: false });
    }
  }

  renderWriteRecipeModal(): ReactElement {
    const { arbitraryRecipe, runningArbitrary } = this.state;

    return (
      <Modal
        show={this.state.showWriteRecipes}
        size="lg"
        onHide={this.hideWriteRecipePopup}
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
            onBeforeChange={this.handleArbitraryRecipeChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            appearance="primary"
            disabled={runningArbitrary}
            onClick={this.runArbitraryRecipe}
          >
            Run
          </Button>
          <Button appearance="subtle" onClick={this.hideWriteRecipePopup}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  renderRunButton(): ReactElement {
    const { environmentKey } = this.props;
    if (environmentKey !== "prod") {
      return null;
    }

    return (
      <Nav.Item icon={<Icon icon="play" />} onClick={this.runNormandy}>
        Run Normandy
      </Nav.Item>
    );
  }

  render(): ReactElement {
    const { page, count } = this.state;
    const { environmentKey } = this.props;

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
                onClick={this.showWriteRecipePopup}
              >
                Write & Run Arbitrary
              </Nav.Item>
              {this.renderRunButton()}
            </Nav>
          </Navbar>
        </Header>

        <div className="page-wrapper">
          {this.renderRecipeList()}
          <div>
            <Pagination
              boundaryLinks
              ellipsis
              first
              last
              next
              prev
              activePage={page}
              maxButtons={5}
              pages={Math.ceil(count / 25)}
              size="lg"
              onSelect={this.handlePageChange}
            />
          </div>
        </div>

        {this.renderWriteRecipeModal()}
      </>
    );
  }
}

export default function WrappedRecipePage(): ReactElement {
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
}
