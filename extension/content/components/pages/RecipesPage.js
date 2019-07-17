import autobind from "autobind-decorator";
import React from "react";
import {
  Drawer,
  Header,
  Icon,
  Loader,
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
      count: 0,
      environment: ENVIRONMENTS.prod,
      loading: false,
      page: 1,
      showSettings: false,
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
      </React.Fragment>
    );
  }
}

export default RecipesPage;
