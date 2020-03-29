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
    match: PropTypes.object,
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
      return (
        <Icon
          icon="check-circle"
          size="lg"
          className="text-success"
          title="Recipe enabled"
        />
      );
    }

    return (
      <Icon
        icon="close-circle"
        size="lg"
        className="text-danger"
        title="Recipe disabled"
      />
    );
  }

  renderFilterIcon() {
    const { recipeSuitabilities } = this.state;

    let style = {};

    let hoverText = "loading...";
    if (recipeSuitabilities) {
      hoverText = recipeSuitabilities
        .map(s => s.replace("RECIPE_SUITABILITY_", ""))
        .join("\n");
    }

    if (recipeSuitabilities && recipeSuitabilities.length == 1) {
      if (recipeSuitabilities[0] == "RECIPE_SUITABILITY_FILTER_MATCH") {
        style.color = "green";
      } else if (
        recipeSuitabilities[0] == "RECIPE_SUITABILITY_FILTER_MISMATCH"
      ) {
        style.color = "red";
      } else {
        style.color = "yellow";
      }
    } else if (
      recipeSuitabilities &&
      recipeSuitabilities.includes("RECIPE_SUITABILITY_")
    ) {
      style.color = "orange";
    } else {
      style.color = "pink";
    }

    return <Icon icon="filter" size="lg" style={style} title={hoverText} />;
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
        <Tag color="cyan">{id}</Tag> {name}
      </React.Fragment>
    );
  }

  handleshowRecipeButton() {
    this.props.showRecipe(this.props.recipe);
  }

  renderRecipeButtonToolBar() {
    const { match, recipe } = this.props;

    return (
      <ButtonToolbar>
        <Button componentClass={Link} to={`${match.path}/edit/${recipe.id}`}>
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
        className="recipe-listing"
        header={this.renderHeader()}
        collapsible
        bordered
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
