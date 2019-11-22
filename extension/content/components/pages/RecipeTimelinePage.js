import autobind from "autobind-decorator";
import React from "react";
import { Loader } from "rsuite";
import { Map } from "immutable";

import BaseApiPage from "devtools/components/pages/BaseApiPage";
import RecipeTimeline from "devtools/components/recipes/RecipeTimeline";

@autobind
class RecipeTimelinePage extends BaseApiPage {
  constructor(props) {
    super(props);

    this.state = {
      // inherit state from BaseApiPage,
      ...this.state,
      recipeId: 730,
      recipeHistories: new Map(),
      error: null,
    };
  }

  handleRecipeIdChange(ev) {
    const recipeId = parseInt(ev.target.value);
    if (!isNaN(recipeId)) {
      this.setState({ recipeId }, this.updateData);
    }
  }

  async updateData() {
    const { environment, recipeId, recipeHistories } = this.state;

    if (recipeId === null) {
      // nothing to do yet
      return;
    }

    if (recipeHistories.hasIn([environment, recipeId])) {
      // cache hit
      return;
    }

    // cache miss
    this.setState({ loading: true });
    try {
      const data = await this.api.fetchRecipeHistory(recipeId);
      this.setState(({ recipeHistories }) => ({
        recipeHistories: recipeHistories.setIn([environment, recipeId], data),
        error: null,
      }));
    } catch (error) {
      this.setState({ error });
    } finally {
      this.setState({ loading: false });
    }
  }

  renderNavItems() {
    return null;
  }

  renderContent() {
    const {
      recipeId,
      recipeHistories,
      loading,
      environment,
      error,
    } = this.state;
    const history = recipeHistories.getIn([environment, recipeId]);

    return (
      <>
        <p>
          <label>Recipe ID:</label>
          <input
            type="number"
            value={recipeId || ""}
            onChange={this.handleRecipeIdChange}
          />
        </p>
        {loading && (
          <div className="text-center">
            <Loader content="Loading recipes&hellip;" />
          </div>
        )}
        {error && (
          <>
            <p>{error.toString()}</p>
            {error.data.detail || (
              <pre>
                <code>{JSON.stringify(error.data, null, 4)}</code>
              </pre>
            )}
          </>
        )}
        {history && (
          <RecipeTimeline history={history} environment={environment} />
        )}
      </>
    );
  }
}

export default RecipeTimelinePage;
