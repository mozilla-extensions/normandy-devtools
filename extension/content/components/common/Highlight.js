import highlight from "highlight.js/lib/core";
import PropTypes from "prop-types";
import React, { Component } from "react";

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
          ref={(ref) => {
            this.codeRef = ref;
          }}
          className={language}
        >
          {children}
        </code>
      </pre>
    );
  }
}
