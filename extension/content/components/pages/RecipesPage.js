import autobind from "autobind-decorator";
import React from "react";
import {
  Button,
  Header,
  Icon,
  Loader,
  Nav,
  Navbar,
  Pagination,
  Panel,
  Tag,
} from "rsuite";
import yaml from "js-yaml";

import api from "../../utils/api";

const normandy = browser.experiments.normandy;

function convertToV1Recipe(v3Recipe) {
  // Normandy expects a v1-style recipe, but we have a v3-style recipe. Convert it.
  return {
    id: v3Recipe.id,
    name: v3Recipe.latest_revision.name,
    enabled: v3Recipe.latest_revision.enabled,
    is_approved: v3Recipe.latest_revision.is_approved,
    revision_id: v3Recipe.latest_revision.id,
    action: v3Recipe.latest_revision.action.name,
    arguments: v3Recipe.latest_revision.arguments,
    filter_expression: v3Recipe.latest_revision.filter_expression,
  };
}

@autobind
export default class RecipesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recipePages: {},
      loading: false,
      page: 1,
      count: 0,
    };

    this.handlePageChange = this.handlePageChange.bind(this);
    this.runNormandy = this.runNormandy.bind(this);
  }

  async runNormandy() {
    await normandy.standardRun();
  }

  async componentDidMount() {
    const { page } = this.state;

    if (page in this.state.recipePages) {
      // cache hit
      this.setState({ page });
      return;
    }

    this.setState({ loading: true });

    let data = await api.fetchRecipePage(page, { ordering: "-id" });
    this.setState(({ recipePages }) => ({
      recipePages: { ...recipePages, [page]: data.results },
      loading: false,
      count: data.count,
    }));
  }

  async handlePageChange(page) {
    if (page in this.state.recipePages) {
      // cache hit
      this.setState({ page });
      return;
    }

    // cache miss
    this.setState({ loading: true });
    let data = await api.fetchRecipePage(page);
    this.setState(({ recipePages }) => ({
      recipePages: { ...recipePages, [page]: data.results },
      page,
      loading: false,
      count: data.count,
    }));
  }

  renderRecipeList() {
    const { loading, page, recipePages } = this.state;
    const recipes = recipePages[page];

    if (loading) {
      return (
        <Loader size="md" speed="slow" content="Loading recipes&hellip;" />
      );
    } else if (recipes) {
      return recipes.map(recipe => <Recipe key={recipe.id} recipe={recipe} />);
    }

    return null;
  }

  render() {
    const { count, loading, page } = this.state;

    return (
      <React.Fragment>
        <Header>
          <Navbar>
            <Nav pullRight>
              <Nav.Item icon={<Icon icon="play" />} onClick={this.runNormandy}>
                Run Normandy
              </Nav.Item>
            </Nav>
          </Navbar>
        </Header>

        <div className="page-wrapper">
          {this.renderRecipeList()}
          {!loading && (
            <Pagination
              activePage={page}
              maxButtons={5}
              pages={count}
              onSelect={this.handlePageChange}
              prev
              next
              first
              last
              ellipsis
              boundaryLinks
            />
          )}
        </div>
      </React.Fragment>
    );
  }
}

@autobind
class Recipe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterMatches: null,
      running: false,
    };
  }

  async componentDidMount() {
    const { recipe } = this.props;
    let filterMatches = await normandy.checkRecipeFilter(
      convertToV1Recipe(recipe),
    );
    this.setState({ filterMatches });
  }

  async handleRunButtonClick(ev) {
    const { recipe } = this.props;
    this.setState({ running: true });
    await normandy.runRecipe(convertToV1Recipe(recipe));
    this.setState({ running: false });
  }

  renderRunButton() {
    const { running } = this.state;

    return (
      <Button onClick={this.handleRunButtonClick} disabled={running}>
        {running ? <Icon icon="reload" spin /> : <Icon icon="play" />} Run
      </Button>
    );
  }

  renderEnabledIcon() {
    const { recipe } = this.props;
    const {
      latest_revision: { enabled },
    } = recipe;

    if (enabled) {
      return <Icon icon="check-circle" size="lg" className="text-success" />;
    }

    return <Icon icon="close-circle" size="lg" className="text-danger" />;
  }

  renderFilterIcon() {
    const { filterMatches } = this.state;

    if (filterMatches) {
      return <Icon icon="filter" size="lg" className="text-success" />;
    }

    return <Icon icon="filter" size="lg" className="text-danger" />;
  }

  renderHeader() {
    const { recipe } = this.props;
    const {
      id,
      latest_revision: { name },
    } = recipe;

    return (
      <React.Fragment>
        <span className="pull-right recipe-actions">
          {this.renderRunButton()}
          {this.renderEnabledIcon()}
          {this.renderFilterIcon()}
        </span>
        <Tag color="cyan">{id}</Tag> {name}
      </React.Fragment>
    );
  }

  render() {
    const { recipe } = this.props;

    const {
      latest_revision: { filter_expression, arguments: arguments_ },
    } = recipe;

    return (
      <Panel header={this.renderHeader()} collapsible bordered>
        <h4>Filter</h4>
        <pre>
          <code>{filter_expression}</code>
        </pre>
        <h4>Arguments</h4>
        <pre>
          <code>
            {yaml.safeDump(arguments_, {
              sortKeys: true,
              indent: 4,
              noRefs: true,
            })}
          </code>
        </pre>
      </Panel>
    );
  }
}
