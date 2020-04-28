import autobind from "autobind-decorator";
import PropTypes from "prop-types";
import React from "react";

import CodeMirror from "devtools/components/common/CodeMirror";

@autobind
class JexlColumn extends React.PureComponent {
  static propTypes = {
    filterExpression: PropTypes.string.isRequired,
    onBeforeChange: PropTypes.func.isRequired,
    onCursorActivity: PropTypes.func,
  };

  focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  handleEditorMounted(editor) {
    this.editor = editor;
  }

  handleBlur() {
    document
      .querySelectorAll(".filter-column .CodeMirror-cursors")
      .forEach((node) => {
        // @ts-ignore
        node.style.visibility = "visible";
      });
  }

  render() {
    const { filterExpression, onBeforeChange, onCursorActivity } = this.props;
    return (
      <div className="filter-column">
        <header>
          <strong>JEXL Filter Expression</strong>
        </header>
        <CodeMirror
          // @ts-ignore
          editorDidMount={this.handleEditorMounted}
          options={{
            mode: "javascript",
            lineNumbers: false,
            styleActiveLine: true,
            gutters: [],
          }}
          style={{
            height: "auto",
          }}
          value={filterExpression}
          onBeforeChange={onBeforeChange}
          onBlur={this.handleBlur}
          onCursorActivity={onCursorActivity}
        />
      </div>
    );
  }
}

export default JexlColumn;
