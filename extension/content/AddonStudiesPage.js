import React from "react";
import { Spin, Collapse } from "antd";

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

  render() {
    const { studies, loading } = this.state;

    return (
      <div className="content">
        <section className="pref-study-viewer">
          <h2>Preference Studies</h2>
          <Spin spinning={loading}>
            <section>
              <h3>Active</h3>
              <Collapse className="recipe-list">
                {studies
                  .filter(study => study.active)
                  .map(study => <Study key={study.id} study={study} />)}
              </Collapse>
            </section>

            <section>
              <h3>Expired</h3>
              <Collapse className="recipe-list">
                {studies
                  .filter(study => !study.active)
                  .map(study => <Study key={study.id} study={study} />)}
              </Collapse>
            </section>
          </Spin>
        </section>
      </div>
    );
  }
}

class Study extends React.Component {
  render() {
    const { study, ...panelProps } = this.props;

    const deliveryConsoleUrl = `https://delivery-console.prod.mozaws.net/recipe/${
      study.recipeId
    }/`;

    return (
      <Collapse.Panel {...panelProps} header={<StudyHeader study={study} />}>
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
      </Collapse.Panel>
    );
  }
}

class StudyHeader extends React.Component {
  render() {
    const {
      study: { name },
    } = this.props;

    return (
      <div className="recipe-header">
        <h3>{name}</h3>
      </div>
    );
  }
}
