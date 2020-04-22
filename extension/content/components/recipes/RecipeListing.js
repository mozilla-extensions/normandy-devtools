import autobind from "autobind-decorator";
import yaml from "js-yaml";
import PropTypes from "prop-types";
import React from "react";
import { Link } from "react-router-dom";
import { Button, Icon, Panel, Tag, ButtonToolbar } from "rsuite";

import { convertToV1Recipe } from "devtools/utils/recipes";

import Highlight from "devtools/components/common/Highlight";

const normandy = browser.experiments.normandy;

@autobind
class RecipeListing extends React.PureComponent {
  static propTypes = {
    environmentName: PropTypes.string,
    recipe: PropTypes.object.isRequired,
    copyRecipeToArbitrary: PropTypes.func.isRequired,
    showRecipe: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      recipeSuitabilities: null,
      running: false,
    };
  }

  async componentDidMount() {
    const { environmentName, recipe } = this.props;
    this.setState({
      recipeSuitabilities: await normandy.getRecipeSuitabilities(
        convertToV1Recipe(recipe, environmentName),
      ),
    });
  }

  handleCopyToArbitraryButtonClick(ev) {
    this.props.copyRecipeToArbitrary(this.props.recipe);
  }

  renderCopyToArbitraryButton() {
    return (
      <Button onClick={this.handleCopyToArbitraryButtonClick}>
        <Icon icon="edit" /> Copy to Arbitrary Editor
      </Button>
    );
  }

  async handleRunButtonClick(ev) {
    const { environmentName, recipe } = this.props;
    this.setState({ running: true });
    await normandy.runRecipe(convertToV1Recipe(recipe, environmentName));
    this.setState({ running: false });
  }

  renderRunButton() {
    const { running } = this.state;

    return (
      <Button disabled={running} onClick={this.handleRunButtonClick}>
        {running ? <Icon spin icon="reload" /> : <Icon icon="play" />} Run
      </Button>
    );
  }

  renderEnabledIcon() {
    const { recipe } = this.props;
    const {
      latest_revision: { enabled },
    } = recipe;

    if (enabled) {
      return (
        <Icon
          className="text-success"
          icon="check-circle"
          size="lg"
          title="Recipe enabled"
        />
      );
    }

    return (
      <Icon
        className="text-danger"
        icon="close-circle"
        size="lg"
        title="Recipe disabled"
      />
    );
  }

  renderFilterIcon() {
    const { recipeSuitabilities } = this.state;

    let hoverText = "loading...";
    if (recipeSuitabilities) {
      hoverText = recipeSuitabilities
        .map((s) => s.replace("RECIPE_SUITABILITY_", ""))
        .join("\n");
    }

    let textColor = "violet";
    if (recipeSuitabilities && recipeSuitabilities.length == 1) {
      if (recipeSuitabilities[0] == "RECIPE_SUITABILITY_FILTER_MATCH") {
        textColor = "green";
      } else if (
        recipeSuitabilities[0] == "RECIPE_SUITABILITY_FILTER_MISMATCH"
      ) {
        textColor = "red";
      } else {
        textColor = "yellow";
      }
    } else if (
      recipeSuitabilities &&
      recipeSuitabilities.includes("RECIPE_SUITABILITY_")
    ) {
      textColor = "orange";
    }

    return (
      <Icon
        className={`text-${textColor}`}
        icon="filter"
        size="lg"
        title={hoverText}
      />
    );
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
          {this.renderCopyToArbitraryButton()}
          {this.renderRunButton()}
          {this.renderEnabledIcon()}
          {this.renderFilterIcon()}
        </span>
        <Tag color="blue">{id}</Tag> {name}
      </React.Fragment>
    );
  }

  handleshowRecipeButton() {
    this.props.showRecipe(this.props.recipe);
  }

  renderRecipeButtonToolBar() {
    const { recipe } = this.props;

    return (
      <ButtonToolbar>
        <Button componentClass={Link} to={`recipes/${recipe.id}/edit`}>
          Edit Recipe
        </Button>

        <Button onClick={this.handleshowRecipeButton}>View Recipe</Button>
      </ButtonToolbar>
    );
  }

  render() {
    const { recipe } = this.props;

    const {
      latest_revision: { filter_expression, arguments: arguments_ },
    } = recipe;

    return (
      <Panel
        bordered
        collapsible
        className="recipe-listing"
        header={this.renderHeader()}
      >
        {this.renderRecipeButtonToolBar()}

        <h4>Filter</h4>
        <Highlight className="javascript">{filter_expression}</Highlight>

        <h4>Arguments</h4>
        <Highlight className="yaml">
          {yaml.safeDump(arguments_, {
            sortKeys: true,
            indent: 4,
            noRefs: true,
          })}
        </Highlight>
      </Panel>
    );
  }
}

export default RecipeListing;
