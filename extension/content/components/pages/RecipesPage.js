import autobind from "autobind-decorator";
import React from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import { Button, Icon, Loader, Modal, Nav, Pagination } from "rsuite";

import { ENVIRONMENTS } from "devtools/config";
import RecipeListing from "devtools/components/recipes/RecipeListing";
import BaseApiPage from "./BaseApiPage";

const normandy = browser.experiments.normandy;

@autobind
class RecipesPage extends BaseApiPage {
  constructor(props) {
    super(props);

    const recipePages = {};
    Object.keys(ENVIRONMENTS).forEach(v => {
      recipePages[v] = {};
    });

    this.state = {
      // inherit state from BaseApiPage,
      ...this.state,
      arbitraryRecipe: "",
      count: 0,
      page: 1,
      runningArbitrary: false,
      showWriteRecipe: false,
      recipePages,
    };
  }

  async runNormandy() {
    await normandy.standardRun();
  }

  async updateData() {
    const { environment, page } = this.state;
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
    let data = await this.api.fetchRecipePage(page, { ordering: "-id" });
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

  renderNavItems() {
    const { environment } = this.state;

    return (
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
        {super.renderNavItems()}
      </>
    );
  }

  renderContent() {
    const { recipePages, loading, count, page, environment } = this.state;
    const recipes = recipePages[environment][page];

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
  }

  renderExtra() {
    return (
      <>
        {super.renderExtra()}
        {this.renderWriteRecipeModal()}
      </>
    );
  }
}

export default RecipesPage;
