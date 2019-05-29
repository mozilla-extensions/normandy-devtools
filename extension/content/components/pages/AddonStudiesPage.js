import React from "react";
import { Loader, Panel } from "rsuite";

const normandy = browser.experiments.normandy;

export default class PrefStudiesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      studies: [],
      loading: true,
    };
  }

  async componentDidMount() {
    this.setState({ loading: true });
    const studies = await normandy.getAddonStudies();
    this.setState({ loading: false, studies });
  }

  renderStudiesList() {
    const { studies, loading } = this.state;

    if (loading) {
      return (
        <Loader size="md" speed="slow" content="Loading studies&hellip;" />
      );
    } else if (studies) {
      return (
        <React.Fragment>
          <h3>Active</h3>
          {studies
            .filter(study => !study.expired)
            .map(study => <Study key={study.id} study={study} />)}
          <h3>Expired</h3>
          {studies
            .filter(study => study.expired)
            .map(study => <Study key={study.id} study={study} />)}
        </React.Fragment>
      );
    }

    return null;
  }

  render() {
    return <div className="page-wrapper">{this.renderStudiesList()}</div>;
  }
}

class Study extends React.Component {
  render() {
    const { study } = this.props;

    const deliveryConsoleUrl = `https://delivery-console.prod.mozaws.net/recipe/${
      study.recipeId
    }/`;

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
