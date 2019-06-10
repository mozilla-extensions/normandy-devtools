import React from "react";
import Highlight from "react-highlight";
import { Icon, Message } from "rsuite";

class Output extends React.PureComponent {
  render() {
    const { value } = this.props;
    return (
      <Highlight className="json">{JSON.stringify(value, null, 2)}</Highlight>
    );
  }
}

export default class OutputColumn extends React.PureComponent {
  renderErrorMessage() {
    const { error } = this.props;
    if (error) {
      return <Message showIcon type="error" description={error.toString()} />;
    }
    return null;
  }

  renderRunningIcon() {
    const { running } = this.props;
    if (running) {
      return <Icon icon="refresh" spin />;
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
            <Icon icon={icon} className={className} title={title} />
          </div>
          <strong>Output</strong>
        </header>
        {this.renderErrorMessage()}
        <Output value={value} />
      </div>
    );
  }
}
