import autobind from "autobind-decorator";
import React, { ReactElement } from "react";
import { Link } from "react-router-dom";
import { Icon, Tag, Panel, Dropdown, Popover, Whisper } from "rsuite";

import { RecipeV3 } from "devtools/types/recipes";
import { convertToV1Recipe } from "devtools/utils/recipes";

import SuitabilityTag from "./details/SuitabilityTag";

const normandy = browser.experiments.normandy;

interface RecipeListingProps {
  environmentName: string;
  recipe: RecipeV3;
  copyRecipeToArbitrary: (recipe: RecipeV3) => void;
}

interface RecipeListingState {
  running: boolean;
}

@autobind
class RecipeListing extends React.PureComponent<
  RecipeListingProps,
  RecipeListingState
> {
  constructor(props: RecipeListingProps) {
    super(props);
    this.state = {
      running: false,
    };
  }

  handleCustomRunClick(): void {
    this.props.copyRecipeToArbitrary(this.props.recipe);
  }

  async handleRunButtonClick(): Promise<void> {
    const { environmentName, recipe } = this.props;
    this.setState({ running: true });
    await normandy.runRecipe(
      convertToV1Recipe(recipe.latest_revision, environmentName),
    );
    this.setState({ running: false });
  }

  renderEnabledIcon(): ReactElement {
    const { recipe } = this.props;
    const {
      latest_revision: { enabled },
    } = recipe;

    if (enabled) {
      return <Tag color="green">Enabled</Tag>;
    }

    return <Tag className="text-danger">Disabled</Tag>;
  }

  renderActionMenu(): ReactElement {
    const { recipe } = this.props;
    const { running } = this.state;

    const speaker = (
      <Popover>
        <Dropdown.Menu style={{ textAlign: "right" }}>
          <Dropdown.Item
            renderItem={(children): ReactElement => (
              <Link to={`recipes/${recipe.id}/edit`}>{children}</Link>
            )}
          >
            Edit <Icon icon="edit" />
          </Dropdown.Item>
          <Dropdown.Item onSelect={this.handleRunButtonClick}>
            Run {running ? <Icon spin icon="reload" /> : <Icon icon="play" />}
          </Dropdown.Item>
          <Dropdown.Item onSelect={this.handleCustomRunClick}>
            Custom Run <Icon icon="gear" />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Popover>
    );

    return (
      <Whisper
        enterable
        placement="bottomEnd"
        speaker={speaker}
        trigger={["hover", "focus"]}
      >
        <Icon
          aria-label="recipe-menu"
          className="ml-1"
          icon="ellipsis-h"
          role="menu-opener"
        />
      </Whisper>
    );
  }

  render(): ReactElement {
    const { recipe } = this.props;

    return (
      <Panel bordered className="recipe-listing mb-2">
        <Link to={`recipes/${recipe.id}`}>
          <Tag className="mr-half" color="blue">
            {recipe.id}
          </Tag>
          {recipe.latest_revision.name}
        </Link>
        <div className="recipe-actions pull-right">
          <SuitabilityTag
            hide={["RECIPE_SUITABILITY_FILTER_MISMATCH"]}
            revision={recipe.latest_revision}
          />
          {this.renderEnabledIcon()}
          {this.renderActionMenu()}
        </div>
      </Panel>
    );
  }
}

export default RecipeListing;
