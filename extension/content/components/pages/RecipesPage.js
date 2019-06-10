import autobind from "autobind-decorator";
import React from "react";
import { Header, Icon, Loader, Nav, Navbar, Pagination } from "rsuite";

import RecipeListing from "devtools/components/recipes/RecipeListing";
import api from "devtools/utils/api";

const normandy = browser.experiments.normandy;

@autobind
export default class RecipesPage extends React.PureComponent {
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
        <div className="text-center">
          <Loader content="Loading recipes&hellip;" />
        </div>
      );
    } else if (recipes) {
      return recipes.map(recipe => (
        <RecipeListing key={recipe.id} recipe={recipe} />
      ));
    }

    return null;
  }

  render() {
    const { count, page } = this.state;

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
      </React.Fragment>
    );
  }
}
