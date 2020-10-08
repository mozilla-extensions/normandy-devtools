import autobind from "autobind-decorator";
import React, { ReactElement } from "react";
import { Link } from "react-router-dom";
import { Icon, Tag, Panel, Dropdown, Popover, Whisper } from "rsuite";

import { RecipeV3 } from "devtools/types/recipes";
import { has } from "devtools/utils/helpers";
import { convertToV1Recipe } from "devtools/utils/recipes";

import SuitabilityTag from "devtools/components/recipes/details/SuitabilityTag";
import { OnlyIf } from "devtools/components/common/OnlyIf";

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

  renderPendingReviewIcon(): ReactElement {
    const { recipe } = this.props;
    const {
      // eslint-disable-next-line
      latest_revision: { approval_request },
    } = recipe;

    if (approval_request && approval_request.approved === null) {
      return <Tag color="yellow">Pending Review</Tag>;
    }

    return null;
  }

  renderHeader(): ReactElement {
    const { recipe } = this.props;
    const linkTarget = `recipes/${recipe.id}`;

    return (
      <div className="d-flex">
        <Link className="flex-grow-0 flex-basis-0" to={linkTarget}>
          <Tag className="mr-half" color="violet">
            {recipe.id}
          </Tag>
        </Link>
        <Link className="flex-grow-1 pr-1" to={linkTarget}>
          {recipe.latest_revision.name}
        </Link>
        <div className="recipe-actions flex-grow-0 flex-shrink-0">
          {__ENV__ === "extension" && (
            <SuitabilityTag
              hide={["RECIPE_SUITABILITY_FILTER_MISMATCH"]}
              revision={recipe.latest_revision}
            />
          )}

          {this.renderPendingReviewIcon()}
          {this.renderEnabledIcon()}
          {this.renderActionMenu()}
        </div>
      </div>
    );
  }

  renderMetaData(): ReactElement {
    const { recipe } = this.props;
    const revision = recipe.latest_revision;

    const metadata = [["Action", <>{revision.action.name}</>]];

    if (has("slug", revision.arguments)) {
      metadata.push([
        "Slug",
        <code key="slug">{revision.arguments.slug}</code>,
      ]);
    }

    if (has("surveyId", revision.arguments)) {
      metadata.push([
        "Survey ID",
        <code key="surveyId">{revision.arguments.surveyId}</code>,
      ]);
    }

    return (
      <dl className="d-flex flex-wrap m-0">
        {metadata.map(([title, value], idx) => (
          <span
            key={`${idx}-${title}`}
            className="flex-grow-1 d-inline-block flex-basis-half"
          >
            <dt>{title}</dt>
            <dd>{value}</dd>
          </span>
        ))}
      </dl>
    );
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
          {__ENV__ === "extension" && (
            <>
              <Dropdown.Item onSelect={this.handleRunButtonClick}>
                Run
                {running ? <Icon spin icon="reload" /> : <Icon icon="play" />}
              </Dropdown.Item>
              <Dropdown.Item onSelect={this.handleCustomRunClick}>
                Custom Run <Icon icon="gear" />
              </Dropdown.Item>
            </>
          )}
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
        <Icon className="ml-1" icon="ellipsis-h" title="recipe-menu" />
      </Whisper>
    );
  }

  render(): ReactElement {
    return (
      <Panel
        bordered
        className="recipe-listing mb-2"
        header={this.renderHeader()}
      >
        {this.renderMetaData()}
      </Panel>
    );
  }
}

export default RecipeListing;
