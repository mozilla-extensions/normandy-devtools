import React from "react";
import autoscroll from "autoscroll-react";

class _LogViewer extends React.Component {
  render() {
    const { messages, ...props } = this.props;
    return (
      <div className="logs" {...props}>
        {messages.map((message, idx) => (
          <div className="log-line" key={idx}>
            {message.message}
          </div>
        ))}
      </div>
    );
  }
}

const LogViewer = autoscroll(_LogViewer);
export default LogViewer;
