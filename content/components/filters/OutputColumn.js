import PropTypes from "prop-types";
import React from "react";
import { Icon, Message } from "rsuite";

import Highlight from "devtools/components/common/Highlight";

class Output extends React.PureComponent {
  static propTypes = {
    value: PropTypes.any,
  };

  render() {
    const { value } = this.props;
    return (
      <Highlight className="json">{JSON.stringify(value, null, 2)}</Highlight>
    );
  }
}

export default class OutputColumn extends React.PureComponent {
  static propTypes = {
    error: PropTypes.object,
    running: PropTypes.bool,
    value: PropTypes.any,
  };

  renderErrorMessage() {
    const { error } = this.props;
    if (error) {
      return <Message showIcon description={error.toString()} type="error" />;
    }

    return null;
  }

  renderRunningIcon() {
    const { running } = this.props;
    if (running) {
      return <Icon spin icon="refresh" />;
    }

    return null;
  }

  render() {
    const { value } = this.props;
    const icon = value ? "check-circle" : "close-circle";
    const className = value ? "text-success" : "text-danger";
    const title = value ? "Truthy" : "Falsy";

    return (
      <div className="filter-column hljs output-column">
        <header>
          <div className="pull-right">
            {this.renderRunningIcon()}
            <Icon className={className} icon={icon} title={title} />
          </div>
          <strong>Output</strong>
        </header>
        {this.renderErrorMessage()}
        <Output value={value} />
      </div>
    );
  }
}
