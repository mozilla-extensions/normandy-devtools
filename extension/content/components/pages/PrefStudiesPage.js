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
    const studies = await normandy.getPreferenceStudies();
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

    return (
      <Panel header={study.name} key={study.name} collapsible bordered>
        <dl>
          <dt>Preference Name</dt>
          <dd>
            <code>{study.preferenceName}</code>
          </dd>

          <dt>Preference Value ({study.preferenceType})</dt>
          <dd>
            <code>{study.preferenceValue}</code>
          </dd>

          <dt>Study Branch</dt>
          <dd>{study.branch}</dd>

          <dt>Experiment Type</dt>
          <dd>
            <code>{study.experimentType}</code>
          </dd>

          <dt>Last Seen</dt>
          <dd>{new Date(study.lastSeen).toLocaleString()}</dd>

          <dt>Preference Branch Type</dt>
          <dd>{study.preferenceBranchType}</dd>

          <dt>Previous Value</dt>
          <dd>
            <code>{study.previousPreferenceValue}</code>
          </dd>
        </dl>
      </Panel>
    );
  }
}
