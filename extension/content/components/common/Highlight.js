import React, { Component } from "react";
import PropTypes from "prop-types";
import highlight from "highlight.js/lib/highlight";

export default class Highlight extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    language: PropTypes.string,
    style: PropTypes.object,
  };

  componentDidMount() {
    highlight.highlightBlock(this.codeRef);
  }

  componentDidUpdate() {
    highlight.initHighlighting.called = false;
    highlight.highlightBlock(this.codeRef);
  }

  render() {
    const { children, className, language, style } = this.props;

    return (
      <pre className={className} style={style}>
        <code
          className={language}
          ref={ref => {
            this.codeRef = ref;
          }}
        >
          {children}
        </code>
      </pre>
    );
  }
}
