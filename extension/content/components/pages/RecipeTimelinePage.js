import autobind from "autobind-decorator";
import React from "react";
import { Loader } from "rsuite";
import { Map } from "immutable";

import BaseApiPage from "devtools/components/pages/BaseApiPage";
import RecipeTimeline from "devtools/components/recipes/RecipeTimeline";

@autobind
class RecipeTimelinePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recipeId: 730,
      recipeHistories: new Map(),
      error: null,
    };
  }

  handleRecipeIdChange(ev, { api, environment }) {
    const recipeId = parseInt(ev.target.value);
    if (!isNaN(recipeId)) {
      this.setState({ recipeId }, () => this.updateData({ api, environment }));
    }
  }

  async updateData({ environment, api }) {
    const { recipeId, recipeHistories } = this.state;

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
      const data = await api.fetchRecipeHistory(recipeId);
      this.setState(({ recipeHistories }) => ({
        recipeHistories: recipeHistories.setIn([environment, recipeId], data),
        error: null,
      }));
    } catch (error) {
      if (!error.data) {
        // not one of our network errors, re-throw
        throw error;
      }
      this.setState({ error });
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { recipeId, recipeHistories } = this.state;

    return (
      <BaseApiPage
        updateData={this.updateData}
        pageContent={({ environment, api }) => {
          const history = recipeHistories.getIn([environment, recipeId]);
          return (
            <>
              <p>
                <label>Recipe ID:</label>
                <input
                  type="number"
                  value={recipeId || ""}
                  onChange={ev =>
                    this.handleRecipeIdChange(ev, { api, environment })
                  }
                />
              </p>
              {this.renderLoading()}
              {this.renderError()}
              {history && (
                <RecipeTimeline history={history} environment={environment} />
              )}
            </>
          );
        }}
      />
    );
  }

  renderError() {
    const { error } = this.state;
    if (!error) {
      return null;
    }
    return (
      <>
        <p>{error.toString()}</p>
        {error.data && error.data.detail ? (
          error.data.detail
        ) : (
          <pre>
            <code>{JSON.stringify(error.data, null, 4)}</code>
          </pre>
        )}
      </>
    );
  }

  renderLoading() {
    const { loading } = this.state;
    if (!loading) {
      return null;
    }
    return (
      <div className="text-center">
        <Loader content="Loading recipes&hellip;" />
      </div>
    );
  }
}

export default RecipeTimelinePage;
