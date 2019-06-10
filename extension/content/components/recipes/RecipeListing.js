import autobind from "autobind-decorator";
import yaml from "js-yaml";
import PropTypes from "prop-types";
import React from "react";
import Highlight from "react-highlight";
import { Button, Icon, Panel, Tag } from "rsuite";

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
class RecipeListing extends React.PureComponent {
  static propTypes = {
    recipe: PropTypes.object.isRequired,
  };

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
      <Panel
        className="recipe-listing"
        header={this.renderHeader()}
        collapsible
        bordered
      >
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
