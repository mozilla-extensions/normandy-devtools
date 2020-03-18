import autobind from "autobind-decorator";
import PropTypes from "prop-types";
import React from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import Highlight from "devtools/components/common/Highlight";
import {
  Button,
  Header,
  Icon,
  Loader,
  Modal,
  Nav,
  Navbar,
  Pagination,
} from "rsuite";

import RecipeListing from "devtools/components/recipes/RecipeListing";
import api from "devtools/utils/api";
import environmentStore from "devtools/utils/environmentStore";
import { convertToV1Recipe } from "devtools/utils/recipes";
import { globalStateContext } from "devtools/contexts/globalState";

const normandy = browser.experiments.normandy;

@autobind
class RecipesPage extends React.PureComponent {
  static propTypes = {
    environment: PropTypes.string,
  };

  constructor(props) {
    super(props);

    const recipePages = {};
    Object.keys(environmentStore.getAll()).forEach(v => {
      recipePages[v] = {};
    });

    this.state = {
      arbitraryRecipe: "",
      count: 0,
      loading: false,
      page: 1,
      runningArbitrary: false,
      showWriteRecipes: false,
      showReadRecipe: false,
      recipeSelected: false,
      recipePages,
    };
  }

  async runNormandy() {
    await normandy.standardRun();
  }

  async componentDidMount() {
    const { page } = this.state;
    const { environment } = this.props;
    this.refreshRecipeList(environment, page);
  }

  async componentDidUpdate(prevProps) {
    const { environment } = this.props;
    if (environment.key !== prevProps.environment.key) {
      this.refreshRecipeList(environment, this.state.page);
    }
  }

  async refreshRecipeList(environment, page) {
    if (
      environment.key in this.state.recipePages &&
      page in this.state.recipePages[environment.key]
    ) {
      // cache hit
      this.setState({ page });
      return;
    }

    // cache miss
    this.setState({ loading: true });
    let data = await api.fetchRecipePage(environment, page, {
      ordering: "-id",
    });
    this.setState(({ recipePages }) => ({
      recipePages: {
        ...recipePages,
        [environment.key]: {
          ...recipePages[environment.key],
          [page]: data.results,
        },
      },
      page,
      loading: false,
      count: data.count,
    }));
  }

  handlePageChange(page) {
    const { environment } = this.props;
    this.refreshRecipeList(environment, page);
  }

  copyRecipeToArbitrary(v3Recipe) {
    const { environment } = this.props;
    const v1Recipe = convertToV1Recipe(v3Recipe, environment.key);
    this.setState({
      arbitraryRecipe: JSON.stringify(v1Recipe, null, 4),
      showWriteRecipes: true,
    });
  }

  renderRecipeList() {
    const { loading, page, recipePages } = this.state;
    const { environment } = this.props;
    const recipes = recipePages[environment.key][page];

    if (loading) {
      return (
        <div className="text-center">
          <Loader content="Loading recipes&hellip;" />
        </div>
      );
    } else if (recipes) {
      return recipes.map(recipe => (
        <RecipeListing
          key={recipe.id}
          recipe={recipe}
          environmentName={environment.key}
          copyRecipeToArbitrary={this.copyRecipeToArbitrary}
          showRecipe={this.showRecipe}
        />
      ));
    }

    return null;
  }

  showWriteRecipePopup() {
    this.setState({ showWriteRecipes: true });
  }

  hideWriteRecipePopup() {
    this.setState({ showWriteRecipes: false });
  }

  handleArbitraryRecipeChange(editor, data, value) {
    this.setState({ arbitraryRecipe: value });
  }

  async runArbitraryRecipe() {
    const { arbitraryRecipe } = this.state;
    this.setState({ runningArbitrary: true });
    /* eslint-disable no-useless-catch */
    try {
      await normandy.runRecipe(JSON.parse(arbitraryRecipe));
    } catch (ex) {
      throw ex;
    } finally {
      this.setState({ runningArbitrary: false });
    }

    /* eslint-enable no-useless-catch */
  }

  showRecipe(recipe) {
    this.setState({ showReadRecipe: true, recipeSelected: recipe });
  }

  hideRecipeModal() {
    this.setState({ showReadRecipe: false });
  }

  renderViewRecipeModal() {
    return (
      <Modal
        show={this.state.showReadRecipe}
        onHide={this.hideRecipeModal}
        size="lg"
      >
        <Modal.Header>
          <Modal.Title>Recipe View</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Highlight language="json">
            {JSON.stringify(this.state.recipeSelected, null, 1)}
          </Highlight>
        </Modal.Body>
      </Modal>
    );
  }

  renderWriteRecipeModal() {
    const { arbitraryRecipe, runningArbitrary } = this.state;

    return (
      <Modal
        show={this.state.showWriteRecipes}
        onHide={this.hideWriteRecipePopup}
        size="lg"
      >
        <Modal.Header>
          <Modal.Title>Write a recipe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CodeMirror
            options={{
              mode: "javascript",
              theme: "neo",
              lineNumbers: true,
              styleActiveLine: true,
            }}
            value={arbitraryRecipe}
            style={{
              height: "auto",
            }}
            onBeforeChange={this.handleArbitraryRecipeChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={this.runArbitraryRecipe}
            appearance="primary"
            disabled={runningArbitrary}
          >
            Run
          </Button>
          <Button onClick={this.hideWriteRecipePopup} appearance="subtle">
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  renderRunButton() {
    const { environment } = this.props;
    if (environment.key !== "prod") {
      return null;
    }
    return (
      <Nav.Item icon={<Icon icon="play" />} onClick={this.runNormandy}>
        Run Normandy
      </Nav.Item>
    );
  }

  render() {
    const { count, page } = this.state;

    return (
      <React.Fragment>
        <Header>
          <Navbar>
            <Nav pullRight>
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
              activePage={page}
              maxButtons={5}
              pages={Math.ceil(count / 25)}
              onSelect={this.handlePageChange}
              size="lg"
              prev
              next
              first
              last
              ellipsis
              boundaryLinks
            />
          </div>
        </div>

        {this.renderWriteRecipeModal()}
        {this.renderViewRecipeModal()}
      </React.Fragment>
    );
  }
}

export default function WrappedRecipePage(props) {
  const { state: globalState } = React.useContext(globalStateContext);
  return (
    <RecipesPage {...props} environment={globalState.selectedEnvironment} />
  );
}
