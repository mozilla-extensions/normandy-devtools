import autobind from "autobind-decorator";
import React from "react";
import Split from "react-split";
import { Loader } from "rsuite";

import DataTree from "devtools/components/common/DataTree";
import JexlColumn from "devtools/components/filters/JexlColumn";
import OutputColumn from "devtools/components/filters/OutputColumn";

const normandy = browser.experiments.normandy;

@autobind
class FiltersPage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      filterExpression: "",
      lastValue: null,
      error: null,
      running: false,
      context: {},
      cursorStart: { line: 0, ch: 0 },
      cursorEnd: { line: 0, ch: 0 },
    };

    this.filterDebounce = null;
  }

  async componentDidMount() {
    const context = await normandy.getClientContext();
    this.setState({ context });
  }

  updateFilter(value) {
    const updatedState = {
      filterExpression: value,
      running: true,
    };
    this.setState(updatedState);
    clearTimeout(this.filterDebounce);
    this.filterDebounce = setTimeout(this.updateFilterResult, 500);
  }

  handleFilterChange(editor, data, value) {
    this.updateFilter(value);
  }

  handleCursorActivity(editor) {
    const from = editor.getCursor("from");
    const to = editor.getCursor("to");
    this.setState({
      cursorStart: { line: from.line, ch: from.ch },
      cursorEnd: { line: to.line, ch: to.ch },
    });
  }

  async updateFilterResult() {
    const { filterExpression } = this.state;
    if (filterExpression === "") {
      this.setState({ running: false, lastValue: null, error: null });
      return;
    }

    this.setState({ running: true });
    try {
      const filterResult = await normandy.evaluateFilter(
        filterExpression,
        this.state.context,
      );
      this.setState({ lastValue: filterResult, error: null });
    } catch (e) {
      this.setState({ error: e });
    } finally {
      this.setState({ running: false });
    }
  }

  handleDoubleClickTreeNode(event, node) {
    const { cursorEnd, cursorStart, filterExpression } = this.state;
    const insert = node.props.value;
    const filterExpressionLines = filterExpression.split("\n");

    if (cursorStart.line === cursorEnd.line) {
      const line = filterExpressionLines[cursorStart.line];

      const newLine =
        line.slice(0, cursorStart.ch) + insert + line.slice(cursorEnd.ch);

      filterExpressionLines.splice(cursorStart.line, 1, newLine);
    } else {
      const firstLine = filterExpressionLines[cursorStart.line];
      const lastLine = filterExpressionLines[cursorEnd.line];
      const newLine =
        firstLine.slice(0, cursorStart.ch) +
        insert +
        lastLine.slice(cursorEnd.ch);

      filterExpressionLines.splice(
        cursorStart.line,
        cursorEnd.line - cursorStart.line + 1,
        newLine,
      );
    }

    this.updateFilter(filterExpressionLines.join("\n"));
    this.jexlColumn.focus();
  }

  render() {
    const { filterExpression, lastValue, error, context, running } = this.state;
    return (
      <Split sizes={[33, 34, 33]} gutterSize={1} className="split">
        <div className="col">
          <div className="filter-column">
            <header>
              <strong>Client Context</strong>
            </header>
            {!context.normandy && (
              <div className="text-center">
                <Loader />
              </div>
            )}
            <DataTree
              data={context.normandy}
              title="normandy"
              key="normandy"
              onDoubleClick={this.handleDoubleClickTreeNode}
            />
          </div>
        </div>
        <div className="col">
          <JexlColumn
            ref={ref => {
              this.jexlColumn = ref;
            }}
            filterExpression={filterExpression}
            onBeforeChange={this.handleFilterChange}
            onCursorActivity={this.handleCursorActivity}
          />
        </div>
        <div className="col">
          <OutputColumn value={lastValue} error={error} running={running} />
        </div>
      </Split>
    );
  }
}

export default FiltersPage;
