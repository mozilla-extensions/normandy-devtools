import PropTypes from "prop-types";
import React from "react";
import { Controlled as CodeMirror } from "react-codemirror2";

// Mode and theme for Code Mirror
import "codemirror/addon/selection/active-line";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/neo.css";

export default class JexlColumn extends React.PureComponent {
  static propTypes = {
    filterExpression: PropTypes.object.isRequired,
    onBeforeChange: PropTypes.func.isRequired,
  };

  render() {
    const { filterExpression, onBeforeChange } = this.props;
    return (
      <div className="filter-column">
        <header>
          <strong>JEXL Filter Expression</strong>
        </header>
        <CodeMirror
          options={{
            mode: "javascript",
            theme: "neo",
            lineNumbers: false,
            styleActiveLine: true,
            gutters: [],
          }}
          value={filterExpression}
          style={{
            height: "auto",
          }}
          onBeforeChange={onBeforeChange}
        />
      </div>
    );
  }
}
