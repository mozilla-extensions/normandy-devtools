import autobind from "autobind-decorator";
import React from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import { Button, Icon, Loader, Modal, Nav, Pagination } from "rsuite";
import { Map } from "immutable";

import { ENVIRONMENTS } from "devtools/config";
import RecipeListing from "devtools/components/recipes/RecipeListing";
import BaseApiPage from "devtools/components/pages/BaseApiPage";

const normandy = browser.experiments.normandy;

@autobind
class RecipesPage extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      // inherit state from BaseApiPage,
      ...this.state,
      arbitraryRecipe: "",
      count: 0,
      page: 1,
      runningArbitrary: false,
      showWriteRecipe: false,
      recipePages: new Map(Object.keys(ENVIRONMENTS).map(v => [v, new Map()])),
    };
  }

  async updateData({ environment, api }) {
    const { page, recipePages } = this.state;
    if (recipePages.hasIn([environment, page])) {
      // cache hit
      this.setState({ page });
      return;
    }

    // cache miss
    this.setState({ loading: true });
    const data = await api.fetchRecipePage(page, { ordering: "-id" });
    this.setState(({ recipePages }) => ({
      recipePages: recipePages.setIn([environment, page], data.results),
      page,
      loading: false,
      count: data.count,
    }));
  }

  async runNormandy() {
    await normandy.standardRun();
  }

  handlePageChange(page) {
    this.setState({ page });
    this.updateData();
  }

  showWriteRecipePopup() {
    this.setState({ showWriteRecipe: true });
  }

  hideWriteRecipePopup() {
    this.setState({ showWriteRecipe: false });
  }

  handleArbitraryRecipeChange(editor, data, value) {
    this.setState({ arbitraryRecipe: value });
  }

  async runArbitraryRecipe() {
    const { arbitraryRecipe } = this.state;
    this.setState({ runningArbitrary: true });
    try {
      await normandy.runRecipe(JSON.parse(arbitraryRecipe));
    } finally {
      this.setState({ runningArbitrary: false });
    }
  }

  renderWriteRecipeModal() {
    const { arbitraryRecipe, runningArbitrary, showWriteRecipe } = this.state;

    return (
      <Modal show={showWriteRecipe} onHide={this.hideWriteRecipePopup}>
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

  render() {
    return (
      <BaseApiPage
        updateData={async ({ environment, api }) =>
          this.updateData({ environment, api })
        }
        navItems={({ environment }) => (
          <>
            <Nav.Item
              icon={<Icon icon="edit" />}
              onClick={this.showWriteRecipePopup}
            >
              Write &amp; Run Arbitrary
            </Nav.Item>
            {environment === "prod" && (
              <Nav.Item icon={<Icon icon="play" />} onClick={this.runNormandy}>
                Run Normandy
              </Nav.Item>
            )}
          </>
        )}
        pageContent={({ environment }) => {
          const { recipePages, loading, count, page } = this.state;
          const recipes = recipePages.getIn([environment, page]);

          return (
            <>
              {loading && (
                <div className="text-center">
                  <Loader content="Loading recipes&hellip;" />
                </div>
              )}
              {recipes &&
                recipes.map(recipe => (
                  <RecipeListing
                    key={recipe.id}
                    recipe={recipe}
                    environmentName={environment}
                  />
                ))}
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
            </>
          );
        }}
        extra={() => this.renderWriteRecipeModal()}
      />
    );
  }
}

export default RecipesPage;
