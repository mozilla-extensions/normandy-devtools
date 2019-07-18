import autobind from "autobind-decorator";
import React from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import {
  Button,
  Drawer,
  Header,
  Icon,
  Loader,
  Modal,
  Nav,
  Navbar,
  Pagination,
  SelectPicker,
} from "rsuite";

import { ENVIRONMENTS } from "devtools/config";
import RecipeListing from "devtools/components/recipes/RecipeListing";
import api from "devtools/utils/api";

const normandy = browser.experiments.normandy;

@autobind
class RecipesPage extends React.PureComponent {
  constructor(props) {
    super(props);

    const recipePages = {};
    Object.values(ENVIRONMENTS).forEach(v => {
      recipePages[v] = {};
    });

    this.state = {
      arbitraryRecipe: "",
      count: 0,
      environment: ENVIRONMENTS.prod,
      loading: false,
      page: 1,
      runningArbitrary: false,
      showSettings: false,
      showWriteRecipes: false,
      recipePages,
    };
  }

  async runNormandy() {
    await normandy.standardRun();
  }

  async componentDidMount() {
    const { environment, page } = this.state;
    this.refreshRecipeList(environment, page);
  }

  async refreshRecipeList(environment, page) {
    if (
      environment in this.state.recipePages &&
      page in this.state.recipePages[environment]
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
        [environment]: {
          ...recipePages.environment,
          [page]: data.results,
        },
      },
      page,
      loading: false,
      count: data.count,
    }));
  }

  handlePageChange(page) {
    const { environment } = this.state;
    this.refreshRecipeList(environment, page);
  }

  handleEnvironmentChange(environment) {
    this.setState({ environment });
    this.refreshRecipeList(environment, 1);
  }

  showSettings() {
    this.setState({ showSettings: true });
  }

  hideSettings() {
    this.setState({ showSettings: false });
  }

  renderRecipeList() {
    const { environment, loading, page, recipePages } = this.state;
    const recipes = recipePages[environment][page];

    let envName = Object.keys(ENVIRONMENTS).find(
      v => ENVIRONMENTS[v] === environment,
    );

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
          environmentName={envName}
        />
      ));
    }

    return null;
  }

  renderSettingsDrawer() {
    const { showSettings, environment } = this.state;

    const envOptions = Object.keys(ENVIRONMENTS).reduce((reduced, value) => {
      reduced.push({
        label: value.charAt(0).toUpperCase() + value.slice(1),
        value: ENVIRONMENTS[value],
      });
      return reduced;
    }, []);

    return (
      <Drawer
        placement="right"
        show={showSettings}
        onHide={this.hideSettings}
        size="xs"
      >
        <Drawer.Header>Settings</Drawer.Header>
        <Drawer.Body>
          <h5>Environment</h5>
          <SelectPicker
            data={envOptions}
            defaultValue={environment}
            cleanable={false}
            searchable={false}
            onChange={this.handleEnvironmentChange}
          />
        </Drawer.Body>
      </Drawer>
    );
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
    try {
      await normandy.runRecipe(JSON.parse(arbitraryRecipe));
    } catch (ex) {
      throw ex;
    } finally {
      this.setState({ runningArbitrary: false });
    }
  }

  renderWriteRecipeModal() {
    const { arbitraryRecipe, runningArbitrary } = this.state;

    return (
      <Modal
        show={this.state.showWriteRecipes}
        onHide={this.hideWriteRecipePopup}
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
    const { environment } = this.state;
    if (environment !== ENVIRONMENTS.prod) {
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
              <Nav.Item icon={<Icon icon="gear" />} onClick={this.showSettings}>
                Settings
              </Nav.Item>
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

        {this.renderSettingsDrawer()}
        {this.renderWriteRecipeModal()}
      </React.Fragment>
    );
  }
}

export default RecipesPage;
