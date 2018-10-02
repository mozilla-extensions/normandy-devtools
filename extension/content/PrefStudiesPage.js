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
    const studies = await normandy.getPreferenceStudies();
    this.setState({ loading: false, studies });
  }

  render() {
    const { studies, loading } = this.state;

    return (
      <div className="content">
        <section className="pref-study-viewer">
          <h2>Preference Studies</h2>
          <Spin spinning={loading}>
            <h3>Active</h3>
            <Collapse className="recipe-list">
              {studies
                .filter(study => !study.expired)
                .map(study => <Study key={study.id} study={study} />)}
            </Collapse>

            <h3>Expired</h3>
            <Collapse className="recipe-list">
              {studies
                .filter(study => study.expired)
                .map(study => <Study key={study.id} study={study} />)}
            </Collapse>
          </Spin>
        </section>
      </div>
    );
  }
}

class Study extends React.Component {
  render() {
    const { study, ...panelProps } = this.props;

    return (
      <Collapse.Panel
        {...panelProps}
        header={<StudyHeader study={study} />}
        key={study.name}
      >
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
      </Collapse.Panel>
    );
  }
}

class StudyHeader extends React.Component {
  render() {
    const { study } = this.props;
    const { name } = study;

    return (
      <div className="recipe-header">
        <h3>{name}</h3>
      </div>
    );
  }
}
