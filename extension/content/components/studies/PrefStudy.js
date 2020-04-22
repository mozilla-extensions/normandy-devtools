import PropTypes from "prop-types";
import React from "react";
import { Panel } from "rsuite";

export default class PrefStudy extends React.PureComponent {
  static propTypes = {
    study: PropTypes.object.isRequired,
  };

  render() {
    const { study } = this.props;

    return (
      <Panel key={study.name} bordered collapsible header={study.name}>
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
