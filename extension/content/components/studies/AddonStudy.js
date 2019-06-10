import PropTypes from "prop-types";
import React from "react";
import { Panel } from "rsuite";

export default class AddonStudy extends React.PureComponent {
  static propTypes = {
    study: PropTypes.object.isRequired,
  };

  render() {
    const { study } = this.props;

    const deliveryConsoleUrl = `https://delivery-console.prod.mozaws.net/recipe/${study.recipeId}/`;

    return (
      <Panel header={study.name} key={study.name} collapsible bordered>
        <dl>
          <dt>Description</dt>
          <dd>
            <blockquote>{study.description}</blockquote>
          </dd>

          <dt>Recipe</dt>
          <dd>
            {" "}
            <a href={deliveryConsoleUrl}>{deliveryConsoleUrl}</a>{" "}
          </dd>

          <dd>{study.recipeId}</dd>

          <dt>Addon</dt>
          <dd>
            <a href={study.addonUrl}>
              <code>{study.addonId}</code> - <code>{study.addonVersion}</code>
            </a>
          </dd>

          <dt>Enrolled at</dt>
          <dd>{new Date(study.studyStartDate).toLocaleString()}</dd>
        </dl>
      </Panel>
    );
  }
}
